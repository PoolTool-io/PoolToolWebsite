# PoolTool 2026 — Frontend API Interface Specification

This document defines what the frontend client can expect from the PoolTool API: REST endpoints, WebSocket behavior, authentication, and data shapes. Base URL for REST is the API origin (e.g. `https://api.pooltool.io`). WebSocket URL is the same origin with path `/ws` (e.g. `wss://api.pooltool.io/ws`).

---

## 1. Authentication

### 1.1 Overview

- Authentication is **stake-key + password** based. The API does **not** use HTTP Bearer token validation on REST endpoints in the current implementation. The login response includes a `token` and `user_id` for the client to store; the client uses `user_id` in paths for user-specific endpoints. The server may later enforce token validation for protected routes.
- **Unauthenticate (logout):** There is no server-side logout or token revocation. The client **unauthenticates** by discarding the stored `token` and `user_id` (e.g. clearing localStorage/sessionStorage). No API call is required.

### 1.2 Register

**Endpoint:** `POST /auth/register`

**Request body (JSON):**

| Field       | Type   | Required | Description                    |
|------------|--------|----------|--------------------------------|
| `stake_key`| string | Yes      | Cardano stake key (hex or bech32) |
| `password` | string | Yes      | User-chosen password            |

**Responses:**

- **200:** `{ "success": true, "user_id": "<uuid>" }`
- **409:** Stake key already registered (body message)

### 1.3 Login

**Endpoint:** `POST /auth/login`

**Request body (JSON):**

| Field       | Type   | Required | Description                    |
|------------|--------|----------|--------------------------------|
| `stake_key`| string | Yes      | Registered stake key           |
| `password` | string | Yes      | Password                        |

**Responses:**

- **200:**  
  `{ "success": true, "user_id": "<uuid>", "token": "<url-safe-token>" }`  
  The client should store `user_id` and `token` for subsequent requests and for identifying the logged-in user.
- **401:** Unknown address or invalid password (body message)

### 1.4 Verification (pool claiming / address verification)

**Start verification:** `POST /auth/verify`

**Request body (JSON):**

| Field       | Type   | Required | Description                    |
|------------|--------|----------|--------------------------------|
| `stake_key`| string | Yes      | Stake key to verify            |
| `user_id`  | string | Yes      | UUID of the user               |
| `password` | string | Yes      | User password                  |

**Responses:**

- **200:**  
  - If already verified: `{ "status": "already_verified" }`  
  - If pending: `{ "status": "pending", "payment_address": "<addr>", "payment_amount": <lovelace> }`  
  - If new: same as pending; client must send exact `payment_amount` (in lovelace) to `payment_address` from the stake key to be verified.

**Check verification status:** `GET /auth/verify/{stake_key}`

**Responses:**

- **200:**  
  - `{ "status": "no_pending_verification" }`  
  - `{ "status": "pending", "payment_amount": <number> }`  
  - `{ "status": "verified", "user_id": "<uuid>" }`

### 1.5 Query address (delegation info)

**Endpoint:** `POST /auth/queryaddress`

**Request body (JSON):** `{ "stake_key": "<stake_key>" }`

**Responses:**

- **200:**  
  - Not found: `{ "success": false, "message": "Address not found" }`  
  - Found:  
    `{ "success": true, "epoch": <number>, "amount": <number>, "delegatedTo": "<pool_id>", "delegatedToTicker": "<ticker>" }`

---

## 2. REST API Endpoints

All REST routes below are under the same origin. Prefix `/api` is used for most resources; `/auth` is used for auth (see §1). All responses are JSON unless noted.

### 2.1 Pools

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pools` | List all non-retired pools (same shape as WebSocket `pools` snapshot). Each pool uses **descriptive keys** (see §4 Pool shape): `pool_id`, `ticker`, `pool_name`, `live_stake`, `two_month_ros`, `one_month_ros`, `lifetime_ros`, etc. |
| GET | `/api/pool/{pool_id}` | Returns `{ "pool": <wire-only>, "pool_stats": {...} }`. `pool` uses descriptive keys only (e.g. `pool_id`, `ticker`, `pool_name`, `live_stake`, `two_month_ros`). `pool_stats` includes `reward_account`, `pool_owners`, `reward_address`, `owners`, `live_stake`, and other detail fields. `pool_id` in path can be bech32 (`pool1...`) or hex. |
| GET | `/api/pool/{pool_id}/history` | Pool history (blocks, assigned_slots, delegators_rewards, pool_fees, ros, stake). Query: `limit` (default 30). |
| GET | `/api/pool/{pool_id}/blocks/{epoch}` | Blocks produced by pool in the given epoch. |
| GET | `/api/pool/{pool_id}/awards` | Milestone awards (e.g. `{"1": true, "10": true}`). |

### 2.2 Blocks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/blocks/{epoch}` | Blocks for epoch in competitive-block format: `{ blockHeight: { poolId: { hash: { ...blockData } } } }`. |
| GET | `/api/recent_block` | Latest block (single object). |

### 2.3 Epoch

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/epoch/{epoch}` | Epoch data (epoch_blocks, last_block_time, etc.). |
| GET | `/api/epoch_params/{epoch}` | Epoch protocol parameters: `monetary_expansion_rate`, `treasury_growth_rate`, `decentralisation`, `influence`, `max_bh_size`, `max_block_size`, etc. |
| GET | `/api/livedata` | Current-epoch params (livedata): same shape as `epoch_params` for latest epoch — `monetary_expansion_rate`, `treasury_growth_rate`, `decentralisation`, `influence`, etc. |
| GET | `/api/active_stake/{epoch}` | Total active stake for epoch: `{ "epoch": <n>, "total_active_stake": <n> }`. |
| GET | `/api/epoch_exchange_rates` | Exchange rates by epoch: `{ "<epoch>": <value>, ... }`. |

### 2.4 Ecosystem

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ecosystem` | Ecosystem summary: `total_staked`, `active_pools`, `delegators`, `rewardpot`, `reserves`, `epochLength` (432000), `activeSlotCoeff` (0.05), and optionally `maxLiveStake` if present in DB. |
| GET | `/api/syncdata` | Sync status: keyed `{ "<key>": { "block": <n>, "bool": <bool> }, ... }` plus numeric **`syncd`**, **`samples`**, **`majoritymax`** (always numbers for reporter ratio and live max tip). |
| GET | `/api/heights` | `{ "latest_block": <number> }`. |

### 2.5 Rewards / stake

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stake_hist/{address}` | Stake history for a stake key (address). List of epoch records. |
| POST | `/api/pivotrewards` | Trigger pivot calculation. Body: `{ "stake_keys": ["<key1>", ...] }`. Max 5 keys. Returns `{ "status": "processing", "keys": [...] }`. Results are pushed via WebSocket on `stake_hist` channel. |

### 2.6 Users (authenticated context)

Endpoints use `user_id` in the path. The client should use the `user_id` returned at login. Currently no token is sent or validated; future versions may require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/{user_id}` | Full user profile: user_id, created_at, authority, myAddresses, myPools, myApiKeys, settings, favorites, userType. |
| PUT | `/api/user/{user_id}/settings` | Update settings/favorites. Body: `{ "settings": {...}, "favorites": ["pool_id", ...] }` (both optional). |
| POST | `/api/user/{user_id}/favorites` | Add favorite. Body: `{ "pool_id": "<pool_id>" }`. |
| DELETE | `/api/user/{user_id}/favorites/{pool_id}` | Remove favorite. |

### 2.7 Translations / i18n

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/translations` | List of available locale codes. |
| GET | `/api/translations/{locale}` | Translation data for locale (JSON object). |
| GET | `/api/languages` | Languages metadata object keyed by locale. |

### 2.8 Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | `{ "status": "ok", "latest_block": <n>, "ws_clients": <n>, "ws_subscriptions": <n>, "periodic_tasks": {...} }`. |

### 2.9 Internal / not for frontend

- **POST `/ouraconsume`** — Oura pipeline webhook; not for browser clients.

---

## 3. WebSocket

### 3.1 Endpoint and connection

- **URL:** Same origin as REST, path **`/ws`** (e.g. `wss://api.pooltool.io/ws`).
- **Protocol:** Standard WebSocket. Messages are UTF-8 JSON text.
- **Connection:** No query parameters or headers are required for basic connect. The server accepts the connection and does not require auth for the WebSocket itself; user-specific data is requested via the `user_data` channel with `params.user_id`.

### 3.2 Client → server (actions)

Every client message must be a JSON object with an `action` field. Optional fields: `channel`, `params`.

| Action | When to use | `channel` | `params` |
|--------|-------------|-----------|----------|
| `subscribe` | Subscribe to a channel (and optionally get initial snapshot). | Required. Channel name (see §3.4). | Optional. Object used to scope the channel (e.g. `pool_id`, `epoch`, `address`, `user_id`). |
| `unsubscribe` | Stop receiving a channel. | Required. Same as used in subscribe. | Optional. Must match the params used when subscribing. |
| `pong` | Response to server `ping` (keepalive). | — | — |

**Examples:**

```json
{ "action": "subscribe", "channel": "pools" }
{ "action": "subscribe", "channel": "pool_stats", "params": { "pool_id": "abc123" } }
{ "action": "subscribe", "channel": "user_data", "params": { "user_id": "uuid-here" } }
{ "action": "unsubscribe", "channel": "pool_stats", "params": { "pool_id": "abc123" } }
{ "action": "pong" }
```

Invalid JSON or unknown `action` results in a server message `{ "type": "error", "msg": "..." }`.

### 3.3 Server → client (message types)

All server messages are JSON objects with at least:

- **`type`** — One of: `ping`, `snapshot`, `update`, `error`.

**Ping (keepalive):**  
`{ "type": "ping", "t": <unix_ts> }`  
Client should reply with `{ "action": "pong" }`. If the client does not respond in time (see §3.5), the server closes the connection.

**Snapshot (initial / full state):**  
`{ "type": "snapshot", "channel": "<channel>", "params": <params>, "seq": <number>, "data": <payload> }`  
Sent once per subscription when the client subscribes (if the channel has a fetcher). This is the **raw data after connect or reconnect**: the client subscribes to the channels it needs, and the server immediately sends a snapshot for each. No separate “download raw data” call is needed — subscribing is the way to get initial state.

**Update (incremental / live):**  
`{ "type": "update", "channel": "<channel>", "params": <params>, "seq": <number>, "data": <payload> }`  
Pushed when backend updates that channel (e.g. new block, pool metadata, user settings). Payload shape is channel-specific; it may be a full replacement or a delta depending on the channel.

**Error:**  
`{ "type": "error", "msg": "<string>" }`

### 3.4 Channels and subscription keys

Subscription key = `channel` + optional `params` (canonical form: `channel:param1_value:param2_value`). Params are used to scope the channel (e.g. which pool, which epoch). Below, “Params” are the keys the client can send in `params` when subscribing; the server uses them to fetch the snapshot and to match broadcasts.

| Channel | Params | Snapshot on subscribe | Live updates | Typical snapshot payload |
|---------|--------|------------------------|--------------|---------------------------|
| `pools` | — | Yes | Yes (full list or per-pool updates) | List of pool objects with **descriptive keys** (see §4): `pool_id`, `ticker`, `pool_name`, `live_stake`, `two_month_ros`, `one_month_ros`, `lifetime_ros`, etc. |
| `pool_stats` | `pool_id` | Yes | Yes | Single pool object (descriptive keys) + extra fields: `description`, `metadata`, `relay_details`, `reward_account`, `pool_owners`, `live_stake`, `two_month_ros`, `one_month_ros`, `lifetime_ros`, etc. |
| `pool_history` | `pool_id`, optional `limit` | Yes | No | `{ blocks, assigned_slots, delegators_rewards, pool_fees, ros, stake }` by epoch. |
| `recent_block` | — | Yes | Yes | Single latest block object. |
| `epoch_data` | optional `epoch` | Yes | Yes | Epoch summary (epoch_blocks, last_block_time, etc.). |
| `epoch_params` | optional `epoch` | Yes | No | Epoch protocol parameters. |
| `ecosystem` | — | Yes | Yes | Ecosystem summary object. |
| `active_stake` | optional `epoch` | Yes | No | `{ epoch, total_active_stake }`. |
| `blocks` | optional `epoch` | Yes | Yes | Competitive-block structure for that epoch. |
| `pool_blocks` | `pool_id`, optional `epoch` | Yes | No | List of block records for pool in epoch. |
| `stake_hist` | `address` (stake key) | Yes | Yes (after pivot or updates) | List of epoch records or pivot result. |
| `epoch_exchange_rates` | — | Yes | No | `{ "<epoch>": <value>, ... }`. |
| `syncdata` | — | Yes | No | Keyed `{ "<key>": { "block", "bool" }, ... }` plus numeric `syncd`, `samples`, `majoritymax`. |
| `heights` | — | Yes | No | `{ "latest_block": <n> }`. |
| `awards` | `pool_id` | Yes | No | `{ "1": true, "10": true, ... }`. |
| `user_data` | `user_id` | Yes | Yes (e.g. after settings update) | User profile (myAddresses, myPools, settings, favorites, userType, etc.). |

### 3.5 Heartbeat and disconnect

- **Heartbeat:** Server sends `ping` at a configurable interval (default 30s). Client must respond with `pong`. If the server does not receive a `pong` within the heartbeat timeout (default 10s after the ping interval), it closes the connection.
- **Disconnect:** Client disconnects by closing the WebSocket (e.g. `ws.close()`). No “goodbye” message is required. On disconnect, the server clears all subscriptions for that connection.
- **Reconnect:** After a reconnect, the client must send `subscribe` again for each channel it needs; the server will send a fresh **snapshot** for each, providing the raw data for that channel. There is no server-side session or “resume subscriptions” — re-subscribe after every connect.

### 3.6 Raw data after connect/reconnect

- **Connect:** Open WebSocket → send one or more `subscribe` messages → receive `snapshot` messages with full state for each channel.
- **Reconnect:** Same: open a new WebSocket, then send the same `subscribe` messages as before; the server sends snapshots again. The client does not call a separate “download raw data” REST endpoint for WebSocket state — the snapshots are the raw data for the subscribed channels.

For REST-only raw data (e.g. full pool list, full epoch blocks), use the REST endpoints in §2; they return the same data as the corresponding WebSocket snapshots.

---

## 4. Data shapes (summary)

### 4.1 Pool (descriptive keys)

Pool list (GET `/api/pools`, WS `pools`) and pool object (GET `/api/pool/{id}` → `pool`, WS `pool_stats`) use **descriptive key names** only. No compressed/short keys.

| Key | Type | Description |
|-----|------|-------------|
| `pool_id` | string | Pool identifier (hex). |
| `ticker` | string | Pool ticker symbol. |
| `pool_name` | string | Display name. |
| `group_name` | string | Group name (optional). |
| `online_relays` | number | Count of online relays. |
| `offline_relays` | number | Count of offline relays. |
| `cost` | number | Fixed cost (lovelace). |
| `margin` | number | Margin (percentage, 0–100). |
| `pledge` | number | Pledge (lovelace). |
| `pool_pledge_value` | number | Pool pledge value. |
| `future_pledge` | number \| null | Pending pledge. |
| `future_pledge_epoch` | number \| null | Epoch for future pledge. |
| `future_cost` | number \| null | Pending cost. |
| `future_cost_epoch` | number \| null | Epoch for future cost. |
| `future_margin` | number | Pending margin (%). |
| `future_margin_epoch` | number \| null | Epoch for future margin. |
| `itn_verified` | boolean | ITN verified flag. |
| `epoch_blocks` | number | Blocks in current epoch. |
| `epoch_blocks_epoch` | number \| null | Epoch of `epoch_blocks`. |
| `life_blocks` | number | Lifetime blocks. |
| `retired` | boolean | Pool retired. |
| `genesis` | boolean | Genesis pool. |
| `rank` | number | Rank. |
| `assigned_slots` | number | Assigned slots (current). |
| `assigned_slots_epoch` | number \| null | Epoch of `assigned_slots`. |
| `imposter` | any \| null | Imposter flag. |
| `lifetime_per_blocks` | number | Lifetime blocks (per). |
| `lifetime_per_slots` | number | Lifetime slots (per). |
| `delegator_count` | number | Number of delegators. |
| `future_retired` | boolean | Pending retirement. |
| `future_retired_epoch` | number \| null | Epoch for future retirement. |
| `live_stake` | number | Active stake (lovelace). |
| `protocol_major` | number | Protocol major version. |
| `protocol_minor` | number | Protocol minor version. |
| `two_month_ros` | number \| null | ROS over last ~2 months (12 epochs). |
| `one_month_ros` | number \| null | ROS over last ~1 month (6 epochs). |
| `lifetime_ros` | number \| null | Lifetime ROS. |

#### Old (compressed) → New (descriptive) key names

Previously the API used short keys to save bandwidth. These are **no longer sent**; the table below is for migration reference only.

| Old key | New key |
|---------|---------|
| `id` | `pool_id` |
| `t` | `ticker` |
| `n` | `pool_name` |
| `g` | `group_name` |
| `o` | `online_relays` |
| `oo` | `offline_relays` |
| `f` | `cost` |
| `m` | `margin` |
| `p` | `pledge` |
| `ap` | `pool_pledge_value` |
| `fp` | `future_pledge` |
| `fpe` | `future_pledge_epoch` |
| `ff` | `future_cost` |
| `ffe` | `future_cost_epoch` |
| `fm` | `future_margin` |
| `fme` | `future_margin_epoch` |
| `i` | `itn_verified` |
| `b` | `epoch_blocks` |
| `eb` | `epoch_blocks_epoch` |
| `l` | `life_blocks` |
| `d` | `retired` |
| `x` | `genesis` |
| `r` | `rank` |
| `z` | `assigned_slots` |
| `ez` | `assigned_slots_epoch` |
| `xx` | `imposter` |
| `zl` | `lifetime_per_blocks` |
| `zs` | `lifetime_per_slots` |
| `dc` | `delegator_count` |
| `fd` | `future_retired` |
| `fde` | `future_retired_epoch` |
| `bs` | *(removed; use `live_stake` only)* |
| `live_stake` | `live_stake` |
| `pm` | `protocol_major` |
| `pn` | `protocol_minor` |
| `tr` | `two_month_ros` |
| `sr` | `one_month_ros` |
| `lros` | `lifetime_ros` |

---

### 4.2 Other data shapes

- **Pool stats (detail):** Returned under `pool_stats` on GET `/api/pool/{pool_id}`. Includes `reward_account`, `pool_owners`, `reward_address`, `owners`, `live_stake`, `description`, `homePage`, `metadataHash`, `metadataUrl`, `relay_details`, `extended_json`, `firstEpoch`, `public_note`, `pooltoolbot_subscribers`. The same pool’s wire object (descriptive keys) is returned as `pool`.
- **Block (recent / list):** `block`, `slot`, `epoch`, `epoch_slot`, `hash`, `pool_id`, `pool_ticker`, `timestamp`, `transactions`, `fees`, `output`, `body_size`, and in competitive view: `leaderPoolId`, `leaderPoolTicker`, `time`, `chained`, `competitive`, `slotbattle`, etc.
- **Epoch data:** `epoch`, `epoch_blocks`, `epoch_feess`, `last_block_time`, `epoch_tx_count`, `epoch_output`, `expected_blocks`.
- **Epoch params / livedata:** `epoch`, `influence`, `max_bh_size`, `max_block_size`, `max_epoch`, `monetary_expansion_rate`, `optimal_pool_count`, `protocol_major`, `protocol_minor`, `treasury_growth_rate`, `decentralisation`, `treasury`, `reserves`, `reward_pot`, `epoch_feess`. Use GET `/api/epoch_params/{epoch}` or GET `/api/livedata` (current epoch) for `monetary_expansion_rate`, `treasury_growth_rate`, `decentralisation`, `influence`.
- **Ecosystem:** `current_epoch`, `total_utxo`, `saturation`, `saturated`, `optimal_pools`, `treasury`, `reserves`, `rewardpot`, `total_staked`, `active_pools`, `delegators`, `epochLength` (number), `activeSlotCoeff` (number), and optionally `maxLiveStake` when present.
- **Syncdata:** Keyed entries `{ "<key>": { "block": <n>, "bool": <bool> }, ... }` plus numeric `syncd` (count of reporters in sync), `samples` (total reporter count), `majoritymax` (max reported block height; use for “live max tip” or fall back to `recent_block.block`).
- **User:** `user_id`, `created_at`, `authority`, `myAddresses`, `myPools`, `myApiKeys`, `settings`, `favorites`, `userType`.
- **Stake history (per epoch):** `epoch`, `amount`, `operator_rewards`, `stake_rewards`, `delegated_to_pool`, `delegated_to_ticker`, `forecast`; pivot result adds `lifeAmount`, `lifeOperatorRewards`, `lifeStakeRewards`, `operatorRewards`, `stakeRewards`, `rewardsSentTo`, `rewardAddrDetails`, `epochsStaked`.

Exact field semantics and types can be inferred from the backend fetchers and REST handlers; this spec gives the frontend a single place for expected endpoints, flows, and payload roles.

---

## 5. Quick reference

| Concern | Behavior |
|--------|----------|
| **Authenticate** | `POST /auth/login` with `stake_key` + `password` → store `user_id` and `token`. |
| **Unauthenticate** | Client discards `token` and `user_id`; no API call. |
| **Subscribe to events** | WebSocket to `/ws` → send `{ "action": "subscribe", "channel": "<name>", "params": {...} }` → receive `snapshot` then `update` messages. |
| **Raw data after connect/reconnect** | Send `subscribe` for each channel; server replies with `snapshot` containing full state. No separate download endpoint. |
| **Disconnect** | Close WebSocket. Server cleans up subscriptions. |
| **Reconnect** | Open new WebSocket, send same `subscribe` messages again to get new snapshots. |
| **REST** | All read endpoints are GET unless noted; user mutations use PUT/POST/DELETE with `user_id` in path. |
| **CORS** | All origins allowed; credentials allowed. |
| **API docs** | Interactive docs at `/docs` (FastAPI Swagger). |

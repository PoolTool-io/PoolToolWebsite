export default {
    data() {
        return {
            "healthHelp":{
           "blockHeightAlignmentHelp": [ //What is the Historical Block Height Alignment Chart?
            "blockHeightAlignmentHelp1",//Often called the "Raindrops Chart" this chart shows us how all reporting nodes are staying up to date with the latest blocks.
            //In an ideal world all nodes would report the same blocks at the same time, but in reality nodes often do not report the latest block all together for various reasons.
            
            "blockHeightAlignmentHelp2", //Whatever block hieght the majority of nodes are on is considered the reference point, and is where 0 is on the left side of the chart.
            //Any node that has stopped reporting will slowly get left behind as the majority of nodes carry on.  At first a node that has stopped reporting will be at -1 on the left
            //side axis, then -2, then -3 and so on.  Nodes that stop reporting look like raindrops in this chart as they fall away from the pack.
            "blockHeightAlignmentHelp3",//nodes are stopped/started all the time due to routine maintenance which will cause these raindrops.  In addition, sometimes nodes will get
            //stuck due to misconfiguration, network issue, etc.  Those also will look like these raindrops.
            "blockHeightAlignmentHelp4",//We use this chart to get an idea of node syncronization, and keep an eye out for large scale failure modes.
           ]
        }

           
        }

    }
}
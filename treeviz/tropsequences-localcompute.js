var dataFile = "tropstrings.json";
var tanakhparts = "torah";

// https://stackoverflow.com/a/3855394
var qs = (function (a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

if (qs["book"] == "shirhashirim") {
    dataFile = "tropstrings-shirhashirim.json";
    tanakhparts = "shirhashirim";
}

var graphHeight = 175;

var hspace = 60,
    vspace = 0;

var tree = d3.layout.tree()
    .nodeSize([210, 30]);
// tree.nodeSize = function() {return [100, 100]; // setting this manually since I'm not using tree() anymore

height = 27 * (tree.nodeSize()[1] + vspace);
width = tree.nodeSize()[0] + hspace;

var x = d3.scale.linear()
    .domain([0, width])
    .range([width, 0]);

d3.select("#vizcontainer")
    .style({ "height": (window.innerHeight - graphHeight - 28) + "px" });

var svg = d3.select("#vizcontainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("direction", "rtl");

var nodes = [];
var links;
var depthsums = d3.map([], function (s) { return s.depth; });
// var linkline = d3.svg.diagonal();
var linkline = function (d) {
    // console.log(d); ok, so it has d.source and d.target
    var starty = (d.source.y + tree.nodeSize()[1] / 2);
    var endy = (d.target.y + tree.nodeSize()[1] / 2);
    var startx = d.source.x;
    var endx = d.target.x + tree.nodeSize()[0];
    var pathstr = "M" + startx + " " + starty + "C " + (startx - hspace / 2) + " " + starty + ", " + (endx + hspace / 2) + " " + endy + ", " + endx + " " + endy;
    return pathstr;
};

var probformat = d3.format(".1%");
var countformat = d3.format(",");

// d3.json("sequencetree-d3format.json", function(root) {
var tropnames = d3.map([{ "char": "\u0597", "name": "revii", "heb": "רְבִיעִ֗י" }, { "char": "\u059d", "name": "gereshmukdam" }, { "char": "\u05a6", "name": "merkhakfula", "heb": "מֵרְכָא־כְפוּלָ֦ה" }, { "char": "\u059e", "name": "gershayim", "heb": "גֵּרְשַׁ֞יִם" }, { "char": "\u059b", "name": "tevir", "heb": "תְּבִ֛יר" }, { "char": "\u059f", "name": "karnepara", "heb": "קַרְנֵי פָרָ֟ה" }, { "char": "\u0595", "name": "gadol", "heb": "גָּד֕וֹל" }, { "char": "\u05a0", "name": "telishagedola", "heb": "תְּ֠לִישָא גְדוֹלָה" }, { "char": "\u0599", "name": "pashta", "heb": "פַּשְׁטָא֙" }, { "char": "\u0593", "name": "shalshelet", "heb": "שַׁלְשֶׁ֓לֶת" }, { "char": "\u0596", "name": "tipkha", "heb": "טִפְּחָ֖א" }, { "char": "\u059a", "name": "yetiv", "heb": "יְ֚תִיב" }, { "char": "\u0592", "name": "segol", "heb": "סֶגוֹל֒" }, { "char": "\u05aa", "name": "yerakhbenyomo", "heb": "יֵרֶח בֶּן יוֹמ֪וֹ" }, { "char": "\u05ae", "name": "zarka", "heb": "זַרְקָא֮" }, { "char": "\u05a3", "name": "munakh", "heb": "מֻנַּ֣ח" }, { "char": "\u05a5", "name": "merkha", "heb": "מֵרְכָ֥א" }, { "char": "\u05a8", "name": "kadma", "heb": "קַדְמָ֨א" }, { "char": "\u0591", "name": "etnakhta", "heb": "אֶתְנַחְתָּ֑א" }, { "char": "\u05c3", "name": "sofpasuk", "heb": "סוֹף פָּסוּק׃" }, { "char": "\u0598", "name": "tsinnorit", "heb": "צִנּוֹרִת֘" }, { "char": "\u059c", "name": "geresh", "heb": "גֵּ֜רֵשׁ" }, { "char": "\u05a9", "name": "telishaketana", "heb": "תְּלִישָא קְטַנָּה֩" }, { "char": "\u05a7", "name": "darga", "heb": "דַּרְגָּ֧א" }, { "char": "\u05a1", "name": "pazer", "heb": "פָּזֵ֡ר" }, { "char": "\u05a4", "name": "mapakh", "heb": "מַהְפַּ֤ך" }, { "char": "\u0594", "name": "katan", "heb": "קָטָ֔ן" }], function (t) { return t.name; });
// var treePreD3 = [];

var tropstrings;
var disaggregated;

var frombeginning = false;
var frombeginningprefix = function () { return frombeginning ? "^" : ""; };

d3.json(dataFile, init);
function init(root) {
    tropstrings = root;

    // go through and read in the root of each tree
    tropnames.forEach(function (t) {
        var node = { "name": tropnames.get(t).name, "char": tropnames.get(t).char, "heb": tropnames.get(t).heb };
        var exp = RegExp(frombeginningprefix() + node.char, "g");
        node.count = d3.sum(tropstrings.filter(function (d) { return d.trop.search(exp) > -1; }).map(function (d) { return d.trop.match(exp).length; }));

        if (node.count > 0) nodes = nodes.concat(tree.nodes(node)); // this needs to go inside the loop because each trop parent is a root
    });

    nodes.sort(function (a, b) { return b.count - a.count; });

    var depthsum = depthsums.get(0) ? depthsums.get(0) : depthsums.set(0, d3.sum(nodes.map(function (d) { return d.count; })));

    nodes.forEach(function (d, i) {
        // don't use the collapse() function here because we don't want need to recurse within a forEach
        // todo: this shouldn't be necessary now because we haven't defined any children
        if (d.children) {
            d._children = d.children;
            d.children = null;
        }

        d.disabled = false;
        d.clicked = false;
        d.x = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
        d.y = i * (vspace + tree.nodeSize()[1]); // - d.depth*(vspace + tree.nodeSize()[1]);

        d.prob = d.count / depthsum;
    });
    links = tree.links(nodes);

    update();
    initgraph();
}

var pos = function (d, i) {
    return "translate(" + d.x + ", " + d.y + ")";
};

var oldypos = function (d) {
    if (this.attributes.getNamedItem("transform")) {
        var t = this.attributes.getNamedItem("transform").nodeValue;
        var oldy = t.substring(t.indexOf(",") + 1, t.indexOf(")"));
    }
    else oldy = d.y;
    return "translate(" + d.x + ", " + oldy + ")";
};

function update() {

    var node = svg.selectAll("g.node").data(nodes, function (d) { return d.name + "," + d.depth; });

    var nodeenter = node.enter()
        .append("g")
        .attr("class", "node")
        .on("click", nodeclick);

    nodeenter.append("rect")
        .attr("class", "outerbox")
        .attr("width", tree.nodeSize()[0])
        .attr("height", tree.nodeSize()[1]);

    nodeenter.append("rect")
        .attr("class", "histbar")
        .attr("y", 0)
        .attr("height", tree.nodeSize()[1]);

    nodeenter.append("text")
        .attr("class", "tropchar")
        .attr("dx", 50)
        .attr("dy", tree.nodeSize()[1] / 2 + 30)
        .text(function (d) { return " " + d.char; });


    nodeenter.append("text")
        .attr("class", "name")
        .attr("dy", tree.nodeSize()[1] / 2 + 6)
        .text(function (d) { return d.heb ? d.heb : d.name; })
        .attr("dx", tree.nodeSize()[0] - 5);

    nodeenter.append("text")
        .attr("class", "count")
        .attr("dx", 4)
        .attr("dy", 26);

    nodeenter.append("text")
        .attr("class", "prob")
        .attr("dx", 4)
        .attr("dy", 12);


    node.select("rect.histbar")
        .attr("x", function (d) { return tree.nodeSize()[0] - tree.nodeSize()[0] * d.prob; })
        .attr("width", function (d) { return tree.nodeSize()[0] * d.prob; });

    node.select("text.count")
        .text(function (d) { return countformat(d.count); });

    node.select("text.prob")
        .text(function (d) { return probformat(d.prob); });

    node
        .attr("transform", oldypos)
        .transition().duration(250)
        .attr("transform", pos);

    node.classed("disabled", function (d) { return d.disabled; });

    node.exit().remove();

    var link = svg.selectAll("path.link")
        .data(links, function (d) { return d.target.name + "," + d.target.depth; });

    link.enter().append("path")
        .attr("class", "link");
    link
        .attr("d", linkline);
    link.classed("disabled", linkclass);
    link.exit().remove();
}

function linkclass(d) {
    return d.target.disabled;
}

function ancestry(n, s) {
    if (s == undefined) {
        s = n.name;
    }
    if (n.parent != undefined) {
        s += "," + n.parent.name;
        return ancestry(n.parent, s);
    }
    else return s;
}

var ancestrynames = [];
function nodeclick(d) {
    ancestrynames = ancestry(d).split(",").reverse(); // the ancestry string is backwards, so I have to do this silly thing.
    var ancestorstring;
    var collapsingroot = false;


    // var maxclickeddepth = d3.max(nodes.filter(function(d) { return d.clicked }).map(function(d) { return d.depth }));
    nodes = nodes.filter(function (n) {
        if (n.depth > d.depth) {
            collapse(n);
        }
        return n.depth <= d.depth;
    });

    // console.log(maxclickeddepth, d.depth);
    var maxdepth = d3.max(nodes.map(function (d) { return d.depth; }));
    if (d.depth == 0 && d.clicked && maxdepth == 0) {
        // TODO: gah what should the right behavior be here?
        // if(d.children) {
        nodes.forEach(function (n) {
            if (n.depth == d.depth) {
                n.clicked = false;
                n.disabled = false;
            }
        });
        d.clicked = false;
        d.disabled = false;
        collapse(d);
        collapsingroot = true;
    }
    else {
        ancestorstring = ancestrynames.map(function (a) { return tropnames.get(a).char; }).join("");
        if (d.children == undefined) { // it's never been calculated. I think this will always be true because collapse() now deletes children.
            var newchildren = [];

            // console.log(ancestrynames);
            tropnames.forEach(function (t) {
                var child = { "name": tropnames.get(t).name, "char": tropnames.get(t).char, "heb": tropnames.get(t).heb };
                var exp = RegExp(frombeginningprefix() + ancestorstring + child.char, "g");
                // console.log(child);

                // this line can do it in one line, but moving it out to a loop so we can also do sources for the graph at the same time
                child.count = d3.sum(tropstrings.filter(function (p) { return p.trop.search(exp) > -1; }).map(function (p) { return p.trop.match(exp).length; }));
                // child.count = 0;


                child.depth = d.depth + 1;
                child.parent = d;
                // console.log(exp);
                // console.log(child);
                if (child.count > 0) newchildren.push(child);
            });

            // treePreD3.find(function() { return d }).children = children;
            var children = tree.nodes(newchildren); //.reverse();
            // console.log(children);
            // d.children = tree.nodes(children);
            d.children = children[0].sort(function (a, b) { return b.count - a.count; });
            // console.log(d);
        }
    }

    // do graph location data
    disaggregated = [];
    var exp = RegExp(frombeginningprefix() + ancestorstring, "g");
    tropstrings.forEach(function (p) {
        var pasukobj = new Object();
        pasukobj.sefer = p.sefer;
        pasukobj.perek = p.perek;
        pasukobj.pasuk = p.pasuk;
        pasukobj.numtrop = p.trop.length;

        var thematch = p.trop.match(exp);
        pasukobj.count = thematch ? thematch.length : 0;

        disaggregated.push(pasukobj);
    });
    const withMatches = disaggregated.filter((p) => p.count);
    console.log(withMatches);
    // width = (d.depth + 1) * (tree.nodeSize()[0] + hspace) + tree.nodeSize()[0];
    // width = (d3.max(nodes.map(function(d) { return d.depth })) + 2) * (tree.nodeSize()[0] + hspace);

    if (d.children) { // this is the more general way of asking whether it's not a sof pasuk
        width = (d3.max(nodes.map(function (d) { return d.depth; })) + 2) * (tree.nodeSize()[0] + hspace);
        x.domain([0, width]);
        x.range([width, 0]);
        svg.attr("width", width);

        nodes.forEach(function (n) {
            // n.x += tree.nodeSize()[0] + hspace;
            n.x = x(n.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
            n.prevy = n.y;


            if (!n.clicked) n.disabled = true;

            if (n.depth == d.depth && n != d) {
                n.clicked = false;
                n.disabled = true;
                collapse(n);
                // links = links.filter(function(l) { return l.source != n});
                // width 
            }
        });

        d.disabled = false;
        d.clicked = true;
        var depthsum = d3.sum(d.children.map(function (n) { return n.count; }));

        d.children.forEach(function (d, i) {
            d.x = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
            // d.prevy = d.y;
            d.y = i * (vspace + tree.nodeSize()[1]);

            d.disabled = false;
            d.clicked = false;

            d.prob = d.count / depthsum;
        });
        nodes = nodes.concat(d.children);
    }
    else if (!collapsingroot) {
        d.clicked = true;
        d.disabled = false;

        nodes.forEach(function (n) {
            if (n.depth == d.depth && n != d) {
                n.clicked = false;
                n.disabled = true;
                collapse(n);
            }

            if (n.depth > d.depth) {
                collapse(n);
            }
        });
    }
    links = tree.links(nodes);
    update();

    if (d.children != null) {
        if (d.children.length == 1) {
            nodeclick(d.children[0]);
        }
    }
    graph();
}

// we can just recalculate it every time it gets re-clicked on
function collapse(d) {
    d.children = null;
}

var graphMargin = { left: 20, right: 66, top: 55, bottom: 18 };
var graphWidth = window.innerWidth - 20;

var graphsvg = d3.select("#graphcontainer")
    .append("svg")
    .attr("width", graphWidth)
    .attr("height", graphHeight);

var barg = graphsvg.append("g")
    .attr("width", graphWidth)
    .attr("height", graphHeight - graphMargin.top - graphMargin.bottom)
    .attr("transform", "translate(" + graphMargin.left + ", " + graphMargin.top + ")");

var graphx = d3.scale.ordinal()
    .rangeBands([graphWidth - graphMargin.right, graphMargin.left], .2);
var graphy = d3.scale.linear()
    .range([graphHeight - graphMargin.top - graphMargin.bottom, 0]);
var barwidth;
var xAxis = d3.svg.axis()
    .orient("bottom")
    .innerTickSize(3)
    .outerTickSize(0);

var xaxisg = graphsvg.append("g")
    .attr("transform", "translate(" + graphMargin.left + ", " + (graphHeight - graphMargin.bottom) + ")")
    .attr("height", graphMargin.bottom);


var tooltipvmargin = 4;
var tooltiphpadding = 4;
var tooltipg = graphsvg.append("g")
    .attr("class", "tooltips")
    .attr("height", graphMargin.top)
    .attr("transform", "translate(" + graphMargin.left + "," + tooltipvmargin + ")");

var byperekdata;
var yValue = "norm";
function graph() {
    var data = aggregate(disaggregated, "perek"); // aggregate by perek
    var bar = barg.selectAll("rect.bar").data(data, function (d) { return d.key; });

    graphy.domain([0, d3.max(data.map(function (d) { return d.values[yValue]; }))]);

    var barenter = bar.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", barwidth)
        .attr("x", function (d) { return graphx(d.key); })
        .attr("y", function (d) { return graphy(d.values[yValue]); })
        .attr("height", function (d) { return (graphHeight - graphMargin.bottom - graphMargin.top) - graphy(d.values[yValue]); })
        .on("mouseover", dotooltip)
        .on("mouseout", function (d) { tooltipg.selectAll("g.mytooltip").remove(); })
        .on("click", graphclick);

    bar.transition().duration(250)
        .attr("y", function (d) { return graphy(d.values[yValue]); })
        .attr("height", function (d) { return (graphHeight - graphMargin.bottom - graphMargin.top) - graphy(d.values[yValue]); });

    bar.exit().transition().duration(250)
        .attr("height", 1)
        .attr("y", graphHeight - graphMargin.bottom - graphMargin.top);
}

var perekindex;
function initgraph() {
    // var perekindex = ["bereshit,1","bereshit,2","bereshit,3","bereshit,4","bereshit,5","bereshit,6","bereshit,7","bereshit,8","bereshit,9","bereshit,10","bereshit,11","bereshit,12","bereshit,13","bereshit,14","bereshit,15","bereshit,16","bereshit,17","bereshit,18","bereshit,19","bereshit,20","bereshit,21","bereshit,22","bereshit,23","bereshit,24","bereshit,25","bereshit,26","bereshit,27","bereshit,28","bereshit,29","bereshit,30","bereshit,31","bereshit,32","bereshit,33","bereshit,34","bereshit,35","bereshit,36","bereshit,37","bereshit,38","bereshit,39","bereshit,40","bereshit,41","bereshit,42","bereshit,43","bereshit,44","bereshit,45","bereshit,46","bereshit,47","bereshit,48","bereshit,49","bereshit,50","shmot,1","shmot,2","shmot,3","shmot,4","shmot,5","shmot,6","shmot,7","shmot,8","shmot,9","shmot,10","shmot,11","shmot,12","shmot,13","shmot,14","shmot,15","shmot,16","shmot,17","shmot,18","shmot,19","shmot,20","shmot,21","shmot,22","shmot,23","shmot,24","shmot,25","shmot,26","shmot,27","shmot,28","shmot,29","shmot,30","shmot,31","shmot,32","shmot,33","shmot,34","shmot,35","shmot,36","shmot,37","shmot,38","shmot,39","shmot,40","vayikra,1","vayikra,2","vayikra,3","vayikra,4","vayikra,5","vayikra,6","vayikra,7","vayikra,8","vayikra,9","vayikra,10","vayikra,11","vayikra,12","vayikra,13","vayikra,14","vayikra,15","vayikra,16","vayikra,17","vayikra,18","vayikra,19","vayikra,20","vayikra,21","vayikra,22","vayikra,23","vayikra,24","vayikra,25","vayikra,26","vayikra,27","bmidbar,1","bmidbar,2","bmidbar,3","bmidbar,4","bmidbar,5","bmidbar,6","bmidbar,7","bmidbar,8","bmidbar,9","bmidbar,10","bmidbar,11","bmidbar,12","bmidbar,13","bmidbar,14","bmidbar,15","bmidbar,16","bmidbar,17","bmidbar,18","bmidbar,19","bmidbar,20","bmidbar,21","bmidbar,22","bmidbar,23","bmidbar,24","bmidbar,25","bmidbar,26","bmidbar,27","bmidbar,28","bmidbar,29","bmidbar,30","bmidbar,31","bmidbar,32","bmidbar,33","bmidbar,34","bmidbar,35","bmidbar,36","dvarim,1","dvarim,2","dvarim,3","dvarim,4","dvarim,5","dvarim,6","dvarim,7","dvarim,8","dvarim,9","dvarim,10","dvarim,11","dvarim,12","dvarim,13","dvarim,14","dvarim,15","dvarim,16","dvarim,17","dvarim,18","dvarim,19","dvarim,20","dvarim,21","dvarim,22","dvarim,23","dvarim,24","dvarim,25","dvarim,26","dvarim,27","dvarim,28","dvarim,29","dvarim,30","dvarim,31","dvarim,32","dvarim,33","dvarim,34"];
    perekindex = d3.set(tropstrings.map(function (p) { return p.sefer + "," + p.perek; })).values();
    perekindex.sort(sortperekindex);

    graphx.domain(perekindex);
    barwidth = graphx.rangeBand();
    xAxis
        .scale(graphx)
        .tickValues(perekindex.filter(function (p) {
            if (tanakhparts == "torah") return p.endsWith(",1");
            else if (tanakhparts == "shirhashirim") return p;
        }))
        .tickFormat(function (t) {
            if (tanakhparts == "torah") {
                if (t == "bereshit,1") return "בראשית";
                else if (t == "shmot,1") return "שמות";
                else if (t == "vayikra,1") return "ויקרא";
                else if (t == "bmidbar,1") return "במדבר";
                else if (t == "dvarim,1") return "דברים";
                else return t;
            }
            else if (tanakhparts == "shirhashirim") {
                return "שיר השירים " + t.split(",")[1];
            }
        });

    xaxisg.call(xAxis);

    disaggregated = perekindex.map(function (i) {
        var split = i.split(",");
        var sefer = split[0];
        var perek = split[1];
        var pasuk = 1; // doesn't matter how many there are, but it's gonna try to agg, so we should have it
        return { "sefer": sefer, "perek": perek, "pasuk": pasuk, numtrop: 1, count: 0 };
    });
    graph();
}

function aggregate(data, by) {
    var aggregated;
    if (by == "perek") {
        aggregated = d3.nest()
            .key(function (d) { return d.sefer + "," + d.perek; })
            .rollup(function (l) {
                var countsum = d3.sum(l, function (d) { return d.count; });
                var normdenominator = l.length;
                return { "sefer": l[0].sefer, "perek": l[0].perek, "count": countsum, "norm": countsum / normdenominator };
            })
            .entries(disaggregated);
    }

    return aggregated;
}

function sortperekindex(a, b) {
    var order = [];
    if (tanakhparts == "torah") {
        order = ["bereshit", "shmot", "vayikra", "bmidbar", "dvarim"];
    }
    else if (tanakhparts == "shirhashirim") {
        order = ["shirhashirim"];
    }
    var aSplit = a.split(",");
    var aSefer = order.indexOf(aSplit[0]);
    var aPerek = +aSplit[1];

    var bSplit = b.split(",");
    var bSefer = order.indexOf(bSplit[0]);
    var bPerek = +bSplit[1];

    if (aSefer != bSefer) return aSefer - bSefer;
    else return aPerek - bPerek;
}

var normformat = d3.format(".2f");
function dotooltip(d) {
    tooltipg.selectAll("g.mytooltip").remove();
    var tooltip = tooltipg.append("g")
        .attr("class", "mytooltip")
        .attr("direction", "ltr");

    var ttbgrect = tooltip.append("rect").attr("class", "mytooltip")
        .attr("rx", 4)
        .attr("ry", 4);

    var locationtext = tooltip.append("text")
        .text(locationformat(d.key))
        .attr("transform", "translate(" + tooltiphpadding + "," + 13 + ")")
        .attr("class", "location");

    var occurrencestext = tooltip.append("text")
        .text(d.values.count + (d.values.count == 1 ? " occurrence" : " occurrences"))
        .attr("transform", "translate(" + tooltiphpadding + "," + 27 + ")");
    var normtext = tooltip.append("text")
        .text(normformat(d.values.norm) + " per pasuk")
        .attr("transform", "translate(" + tooltiphpadding + "," + 41 + ")");

    var ttwidth = occurrencestext[0][0].getComputedTextLength() > normtext[0][0].getComputedTextLength() ? occurrencestext[0][0].getComputedTextLength() : normtext[0][0].getComputedTextLength();
    ttbgrect
        .attr("width", ttwidth + 2 * tooltiphpadding)
        .attr("height", graphMargin.top - 2 * tooltipvmargin);

    tooltip.attr("transform", "translate(" + (graphx(d.key) - ttwidth / 2) + ")");
}

function graphclick(d) {
    var pasuklist = disaggregated.filter(function (p) { return p.sefer == d.values.sefer && p.perek == d.values.perek && p.count > 0; });
    var outpasuklist = disaggregated.filter(function (p) { return p.sefer == d.values.sefer && p.perek == d.values.perek && p.count == 0; });

    d3.select("#detailsModalLabel").html(locationformat(d.key));
    d3.select("#currentSearch").html(ancestrynames.map(function (d) { return tropnames.get(d).heb; }).join(" "));
    d3.select("#detailsContainer").html('<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div></div>');
    $("#detailsModal").modal("show");

    var textlist = [];
    // http://www.sefaria.org/api/texts/Exodus.16?lang=he&commentary=0&context=0
    d3.jsonp("//www.sefaria.org/api/texts/" + linkformat(d.key) + "?lang=he&commentary=0&context=0&callback={callback}", function (r) {
        textlist = d3.map(r.he.map(function (t, p) { return { 'pasuk': p + 1, 'text': t }; }), function (p) { return p.pasuk; });
        d3.select("#in").html('<table id="indetails"></div>');
        d3.select("#not-in").html('<table id="outdetails"></div>');
        pasuklist.forEach(function (p) {
            d3.select("#indetails").append("tr").html("<td class='pasuknum'>" + p.pasuk + "</td><td class='pasuktext'>" + textlist.get(p.pasuk).text + "</td>"); //p.sefer + " " + p.perek + " " + p.pasuk);
        });
        outpasuklist.forEach(function (p) {
            d3.select("#outdetails").append("tr").html("<td class='pasuknum'>" + p.pasuk + "</td><td class='pasuktext'>" + textlist.get(p.pasuk).text + "</td>");
        });
    });
}


function switchYvalue(d) {
    yValue = d.value;
    graph();
}
d3.selectAll(".graphValues")
    .datum(function () { return this.dataset; })
    .on("change", switchYvalue);

function switchSearchFrom(d) {
    frombeginning = d.value == "beginning" ? true : false;
    nodes = [];
    depthsums = d3.map([], function (s) { return s.depth; }); // I could probably just kill depthsums entirely. doubt i'm getting much performance gain from caching like this
    init(tropstrings);

    var depth = 0;
    var oldQuery = ancestrynames.map(function (a) { return a; }); // deep copy
    var toclick = nodes.filter(function (d) { return d.depth == depth && d.name == oldQuery[depth]; });

    while (toclick.length > 0) {
        // console.log(depth, toclick);
        nodeclick(toclick[0]);
        depth = depth + 1;
        toclick = nodes.filter(function (d) { return d.depth == depth && d.name == oldQuery[depth]; });
    }
}
d3.selectAll(".searchFrom")
    .datum(function () { return this.dataset; })
    .on("change", switchSearchFrom);



var locationformat = function (t) {
    var split = t.split(",");

    var sefer;
    if (tanakhparts == "torah") {
        if (split[0] == "bereshit") sefer = "בראשית"; // "Bereshit";
        else if (split[0] == "shmot") sefer = "שמות"; // "Shmot";
        else if (split[0] == "vayikra") sefer = "ויקרא"; // "Vayikra";
        else if (split[0] == "bmidbar") sefer = "במדבר"; // "B’midbar";
        else if (split[0] == "dvarim") sefer = "דברים"; // "D’varim";
    }
    else if (tanakhparts == "shirhashirim") sefer = "שיר השירים";

    return sefer + " " + split[1];
};

var linkformat = function (t) {
    var split = t.split(",");

    var sefer;
    if (tanakhparts == "torah") {
        if (split[0] == "bereshit") sefer = "Genesis";
        else if (split[0] == "shmot") sefer = "Exodus";
        else if (split[0] == "vayikra") sefer = "Leviticus";
        else if (split[0] == "bmidbar") sefer = "Numbers";
        else if (split[0] == "dvarim") sefer = "Deuteronomy";
    }
    else if (tanakhparts == "shirhashirim") {
        sefer = "Song_of_Songs";
    }

    return sefer + "." + split[1];
};

d3.select(window).on("resize", function () {
    d3.select("#vizcontainer")
        .style({ "height": (window.innerHeight - graphHeight - 28) + "px" });

    graphWidth = window.innerWidth - 20;
    graphsvg.attr("width", graphWidth);
    barg.attr("width", graphWidth);
    graphx.rangeBands([graphWidth - graphMargin.right, graphMargin.left], .2);
    barwidth = graphx.rangeBand();
    xaxisg.call(xAxis);
    barg.selectAll(".bar")
        .attr("width", barwidth)
        .attr("x", function (d) { return graphx(d.key); });

    d3.select("#cog")
        .style({ "top": (window.innerHeight - graphHeight - 48) + "px" });
});


d3.select("#cog")
    .style({ "top": (window.innerHeight - graphHeight - 48) + "px" });

$("#cog").click(function () { $("#tab-settings").tab("show"); });

$("button[role=tab]").click(function () {
    $("button[role=tab]").removeClass("btn-primary");
    $(this).addClass("btn-primary");
});

if (Cookies.get("firstload") != "no") {
    $("#prefs").modal("show");
}

Cookies.set("firstload", "no", { expires: 7 });

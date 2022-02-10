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

const GRAPH_HEIGHT = 175;

const HSPACE = 60,
    VSPACE = 0;

var tree = d3.layout.tree()
    .nodeSize([210, 30]);
// tree.nodeSize = function() {return [100, 100]; // setting this manually since I'm not using tree() anymore

height = 27 * (tree.nodeSize()[1] + VSPACE);
width = tree.nodeSize()[0] + HSPACE;

var x = d3.scale.linear()
    .domain([0, width])
    .range([width, 0]);

d3.select("#vizcontainer")
    .style({ "height": (window.innerHeight - GRAPH_HEIGHT - 28) + "px" });

var svg = d3.select("#vizcontainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("direction", "rtl");

var nodes = [];

var depthsums = d3.map([], function (s) { return s.depth; });

var probformat = d3.format(".1%");
var countformat = d3.format(",");
const TROP = [
    { "char": "\u0597", "name": "revii", "heb": "רְבִיעִ֗י", "examples": ["בָּ֗רָא", "בָּרָ֗א"] },
    { "char": "\u059d", "name": "gereshmukdam", "examples": [] },
    { "char": "\u05a6", "name": "merkhakfula", "heb": "מֵרְכָא־כְפוּלָ֦ה", "examples": [] },
    { "char": "\u059e", "name": "gershayim", "heb": "גֵּרְשַׁ֞יִם", "examples": ["בָּרָ֞א", "בָּ֞רָא"] },
    { "char": "\u059b", "name": "tevir", "heb": "תְּבִ֛יר", "examples": ["בָּרָ֛א", "בָּ֛רָא"] },
    { "char": "\u059f", "name": "karnepara", "heb": "קַרְנֵי פָרָ֟ה", "examples": [] },
    { "char": "\u0595", "name": "gadol", "heb": "גָּד֕וֹל", "examples": ["בָּ֕רָא", "בָּרָ֕א"] },
    { "char": "\u05a0", "name": "telishagedola", "heb": "תְּ֠לִישָא גְדוֹלָה", "examples": ["בָּ֠רָא", "בָּ֠רָ֠א"] },
    { "char": "\u0599", "name": "pashta", "heb": "פַּשְׁטָא֙", "examples": ["בָּרָָא֙", "בָּ֙רָָא֙"] },
    { "char": "\u0593", "name": "shalshelet", "heb": "שַׁלְשֶׁ֓לֶת", "examples": [] },
    { "char": "\u0596", "name": "tipkha", "heb": "טִפְּחָ֖א", "examples": ["בָּרָ֖א", "בָּ֖רָא"] },
    { "char": "\u059a", "name": "yetiv", "heb": "יְ֚תִיב", "examples": ["בָּ֚רָא"] },
    { "char": "\u0592", "name": "segol", "heb": "סֶגוֹל֒", "examples": ["בָּרָ֒א"] },
    { "char": "\u05aa", "name": "yerakhbenyomo", "heb": "יֵרֶח בֶּן יוֹמ֪וֹ", "examples": [] },
    { "char": "\u05ae", "name": "zarka", "heb": "זַרְקָא֮", "examples": ["בָּרָ֘א"] },
    { "char": "\u05a3", "name": "munakh", "heb": "מֻנַּ֣ח", "examples": ["בָּרָ֣א", "בָּ֣רָא"] },
    { "char": "\u05a5", "name": "merkha", "heb": "מֵרְכָ֥א", "examples": ["בָּרָ֥א"] },
    { "char": "\u05a8", "name": "kadma", "heb": "קַדְמָ֨א", "examples": ["בָּרָ֙א", "בָּ֙רָא"] },
    { "char": "\u0591", "name": "etnakhta", "heb": "אֶתְנַחְתָּ֑א", "examples": ["בָּרָ֑א", "בָּ֑רָא"] },
    { "char": "\u05c3", "name": "sofpasuk", "heb": "סוֹף פָּסוּק׃", "examples": ["בָּרָֽא׃", "בָּרָֽא׃"] },
    { "char": "\u0598", "name": "tsinnorit", "heb": "צִנּוֹרִת֘", "examples": [] },
    { "char": "\u059c", "name": "geresh", "heb": "גֵּ֜רֵשׁ", "examples": ["בָּרָ֜א"] },
    { "char": "\u05a9", "name": "telishaketana", "heb": "תְּלִישָא קְטַנָּה֩", "examples": ["בָּרָא֩", "בָּ֩רָא֩"] },
    { "char": "\u05a7", "name": "darga", "heb": "דַּרְגָּ֧א", "examples": ["בּ֧רָא", "בָּרָ֧א"] },
    { "char": "\u05a1", "name": "pazer", "heb": "פָּזֵ֡ר", "examples": ["בָּ֡רָא", "בָּרָ֡א"] },
    { "char": "\u05a4", "name": "mapakh", "heb": "מַהְפַּ֤ך", "examples": ["בָּ֤רָא", "בָּרָ֤א"] },
    { "char": "\u0594", "name": "katan", "heb": "קָטָ֔ן", "examples": ["בָּ֔רָא", "בָּרָ֔א"] }
];
var tropnames = d3.map(TROP, function (t) { return t.name; });

var tropstrings;
var disaggregated;
const settings = {
    frombeginning: false,
    displayExample: false
};

d3.selectAll(".searchFrom")
    .datum(function () { return this.dataset; })
    .on("change", switchSearchFrom);

function switchSearchFrom(d) {
    settings.frombeginning = d.value == "beginning" ? true : false;
    nodes = [];
    depthsums = d3.map([], function (s) { return s.depth; }); // I could probably just kill depthsums entirely. doubt i'm getting much performance gain from caching like this
    init(tropstrings);

    var depth = 0;
    var oldQuery = ancestrynames.map(function (a) { return a; }); // deep copy
    var toclick = nodes.filter(function (d) { return d.depth == depth && d.name == oldQuery[depth]; });

    while (toclick.length > 0) {
        nodeclick(toclick[0]);
        depth = depth + 1;
        toclick = nodes.filter(function (d) { return d.depth == depth && d.name == oldQuery[depth]; });
    }
}

function switchDisplaySetting(d) {
    settings.displayExample = d.value === "example";
    applySearchSeq();
}

d3.selectAll(".displaySetting")
    .datum(function () { return this.dataset; })
    .on("change", switchDisplaySetting);

function switchYvalue(d) {
    yValue = d.value;
    graph();
}
d3.selectAll(".graphValues")
    .datum(function () { return this.dataset; })
    .on("change", switchYvalue);

var frombeginningprefix = function () { return settings.frombeginning ? "^" : ""; };

d3.json(dataFile, init);
function init(root) {
    tropstrings = root;

    // go through and read in the root of each tree
    tropnames.forEach(function (t) {
        var node = { ...tropnames.get(t) };
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
        d.x = x(d.depth * (HSPACE + tree.nodeSize()[0])) - tree.nodeSize()[0];
        d.y = i * (VSPACE + tree.nodeSize()[1]); // - d.depth*(vspace + tree.nodeSize()[1]);

        d.prob = (d.count / depthsum) || 0;
    });

    update();
    initgraph();
    $("#clearButton").click(clearClick);
    $("#backspaceButton").click(backspaceClick);
    window.addEventListener("keydown", (e) => {
        if (e.key === 'Backspace') {
            backspaceClick();
        }
    });
    $("#randomButton").click(randomClick);

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
        .attr("x", (d) => tree.nodeSize()[0] - tree.nodeSize()[0] * d.prob)
        .attr("width", (d) => tree.nodeSize()[0] * d.prob);

    node.select("text.count")
        .text((d) => countformat(d.count));

    node.select("text.prob")
        .text((d) => probformat(d.prob));

    node
        .attr("transform", oldypos)
        .transition().duration(250)
        .attr("transform", pos);

    node.classed("disabled", function (d) { return d.disabled; });

    node.exit().remove();
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

let searchSeq = [];
var ancestrynames = [];

function nodeclick(d) {
    ancestrynames = ancestry(d).split(",").reverse(); // the ancestry string is backwards, so I have to do this silly thing.

    searchSeq.push(d);
    applySearchSeq();
}

function clearClick() {
    searchSeq = [];
    applySearchSeq();
}
function backspaceClick() {
    searchSeq = searchSeq.slice(0, -1);
    applySearchSeq();
}

/** Sets the searchSeq to a random passuk */
function randomClick() {
    const pasuk = tropstrings[Math.floor(Math.random() * tropstrings.length)];
    searchSeq = [...pasuk.trop].map((tropChar) => tropnames.values().find((trop) => trop.char === tropChar));
    applySearchSeq();
}

function applySearchSeq() {
    const searchString = searchSeq.map((trop) => trop.char).join("");
    const searchText = searchSeq
        .map((trop) => {
            if (settings.displayExample && trop.examples.length) {
                return trop.examples[Math.floor(Math.random() * trop.examples.length)];
            }
            else {
                return trop.heb;
            }
        })
        .join(" ");

    $("#searchSeq").text(searchText);

    nodes.forEach((node) => {
        var exp = RegExp(frombeginningprefix() + searchString + node.char, "g");

        node.count = d3.sum(tropstrings
            .filter((p) => p.trop.search(exp) > -1)
            .map((p) => p.trop.match(exp).length));
        node.disabled = !node.count;
    });
    const totalCountOfContinuations = d3.sum(nodes.map((node) => node.count));
    nodes.forEach((node) => {
        node.prob = (node.count / totalCountOfContinuations) || 0;
    });

    let totalOccurrences = 0;
    // do graph location data
    disaggregated = [];
    var exp = RegExp(frombeginningprefix() + searchString, "g");
    tropstrings.forEach(function (p) {
        var pasukobj = new Object();
        pasukobj.sefer = p.sefer;
        pasukobj.perek = p.perek;
        pasukobj.pasuk = p.pasuk;
        pasukobj.numtrop = p.trop.length;

        var thematch = p.trop.match(exp);
        pasukobj.count = thematch ? thematch.length : 0;
        totalOccurrences += pasukobj.count;
        disaggregated.push(pasukobj);
    });

    if (searchSeq.length !== 0) {
        const occurenceText = totalOccurrences === 1 ? "1 occurrence." : `${totalOccurrences} occurrences.`;
        $("#occurrences").text(occurenceText);
    }
    else {
        $("#occurrences").text("");
    }

    update();
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
    .attr("height", GRAPH_HEIGHT);

var barg = graphsvg.append("g")
    .attr("width", graphWidth)
    .attr("height", GRAPH_HEIGHT - graphMargin.top - graphMargin.bottom)
    .attr("transform", "translate(" + graphMargin.left + ", " + graphMargin.top + ")");

var graphx = d3.scale.ordinal()
    .rangeBands([graphWidth - graphMargin.right, graphMargin.left], .2);
var graphy = d3.scale.linear()
    .range([GRAPH_HEIGHT - graphMargin.top - graphMargin.bottom, 0]);
var barwidth;
var xAxis = d3.svg.axis()
    .orient("bottom")
    .innerTickSize(3)
    .outerTickSize(0);

var xaxisg = graphsvg.append("g")
    .attr("transform", "translate(" + graphMargin.left + ", " + (GRAPH_HEIGHT - graphMargin.bottom) + ")")
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
        .attr("height", function (d) { return (GRAPH_HEIGHT - graphMargin.bottom - graphMargin.top) - graphy(d.values[yValue]); })
        .on("mouseover", dotooltip)
        .on("mouseout", function (d) { tooltipg.selectAll("g.mytooltip").remove(); })
        .on("click", graphclick);

    bar.transition().duration(250)
        .attr("y", function (d) { return graphy(d.values[yValue]); })
        .attr("height", function (d) { return (GRAPH_HEIGHT - graphMargin.bottom - graphMargin.top) - graphy(d.values[yValue]); });

    bar.exit().transition().duration(250)
        .attr("height", 1)
        .attr("y", GRAPH_HEIGHT - graphMargin.bottom - graphMargin.top);
}

var perekindex;
function initgraph() {
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
        .style({ "height": (window.innerHeight - GRAPH_HEIGHT - 28) + "px" });

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
        .style({ "top": (window.innerHeight - GRAPH_HEIGHT - 48) + "px" });
});


d3.select("#cog")
    .style({ "top": (window.innerHeight - GRAPH_HEIGHT - 48) + "px" });

$("#cog").click(function () { $("#tab-settings").tab("show"); });

$("button[role=tab]").click(function () {
    $("button[role=tab]").removeClass("btn-primary");
    $(this).addClass("btn-primary");
});

if (Cookies.get("firstload") != "no") {
    $("#prefs").modal("show");
}

Cookies.set("firstload", "no", { expires: 7 });

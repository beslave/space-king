var PERFORMANCE_LOG = {};

function patch_function(obj, prev, name, mname){
    function magic(){
        var t1 = Date.now();
        var rez = prev.apply(obj, magic.arguments);
        var t2 = Date.now();
        PERFORMANCE_LOG[name][mname][0]++;
        PERFORMANCE_LOG[name][mname][1] += t2 - t1;
        return rez;        
    };
    return magic;
}

function check_performance(name, obj, methods){
    if(typeof(PERFORMANCE_LOG[name]) == "undefined") PERFORMANCE_LOG[name] = {};
    for(var i in methods){
        var mname = methods[i];
        PERFORMANCE_LOG[name][mname] = [0, 0];
        obj[mname] = patch_function(obj, obj[mname], name, mname);
    }
}

function toLen(str, len, ch){
    ch = ch || " ";
    while(str.length < len) str += ch;
    return str;
}

function getPerformanceLogs(){
    var logs = "";
    for(var l in PERFORMANCE_LOG){
        logs += l.toUpperCase() + ":\n";
        for(var m in PERFORMANCE_LOG[l]){
            logs += "........" + toLen(m, 32, ".") + ": ";
            logs += toLen(PERFORMANCE_LOG[l][m][0] + " - whole calls,", 40);
            logs += PERFORMANCE_LOG[l][m][1] + " - whole milliseconds.";
            logs += "\n";
        }
        logs += "\n";
    }
    return logs;
}
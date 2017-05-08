// Define a class like this
function MyColors(colorcount){

    this.colorcount = colorcount;;
    this.colors = [];

    var COLOR_COUNTS = this.colorcount;
    var COLOR_FIRST = "#fdd0a2", COLOR_LAST = "#8c2d04";

    var rgb = this.hexToRgb(COLOR_FIRST);
    var COLOR_START = new this.Color(rgb.r, rgb.g, rgb.b);

    rgb = this.hexToRgb(COLOR_LAST);
    var COLOR_END = new this.Color(rgb.r, rgb.g, rgb.b);

    var startColors = COLOR_START.getColors(),
        endColors = COLOR_END.getColors();
 
    for (var i = 0; i <= COLOR_COUNTS; i++) {
        var r = this.Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
        var g = this.Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
        var b = this.Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
        this.colors.push(new this.Color(r, g, b));
    }
}

MyColors.prototype.Interpolate = function(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

MyColors.prototype.Color = function(_r, _g, _b) {
    var r, g, b;
    var setColors = function(_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function() {
        var colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}

MyColors.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

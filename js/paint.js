
// 拖动
(function($) {
    $.fn.dragDiv = function(divWrap) {
        return this.each(function() {
            var $divMove = $(this);//鼠标可拖拽区域
            var $divWrap = divWrap ? $divMove.parents(divWrap) : $divMove;//整个移动区域
            var mX = 0, mY = 0;//定义鼠标X轴Y轴
            var dX = 0, dY = 0;//定义div左、上位置
            var isDown = false;//mousedown标记
            if(document.attachEvent) {//ie的事件监听，拖拽div时禁止选中内容，firefox与chrome已在css中设置过-moz-user-select: none; -webkit-user-select: none;
                $divMove[0].attachEvent('onselectstart', function() {
                    return false;
                });
            }
            $divMove.mousedown(function(event) {
                var event = event || window.event;
                mX = event.clientX;
                mY = event.clientY;
                dX = $divWrap.offset().left-50;
                dY = $divWrap.offset().top-50;
                isDown = true;//鼠标拖拽启动
            });
            $(document).mousemove(function(event) {
                var event = event || window.event;
                var x = event.clientX;//鼠标滑动时的X轴
                var y = event.clientY;//鼠标滑动时的Y轴
                if(isDown) {
                    $divWrap.css({"left": x - mX + dX, "top": y - mY + dY});//div动态位置赋值
                }
            });
            $divMove.on('mouseup',function() {

                isDown = false;//鼠标拖拽结束
            });
        });
    };
})(jQuery);

//ctx_2d        getContext("2d") 对象
//lineheight    段落文本行高
//bytelength    设置单字节文字一行内的数量
//text          写入画面的段落文本
//startleft     开始绘制文本的 x 坐标位置（相对于画布）
//starttop      开始绘制文本的 y 坐标位置（相对于画布）
function writeTextOnCanvas(ctx_2d, lineheight, bytelength, text ,startleft, starttop){
    function getTrueLength(str){//获取字符串的真实长度（字节长度）
        var len = str.length, truelen = 0;
        for(var x = 0; x < len; x++){
            if(str.charCodeAt(x) > 128){
                truelen += 2;
            }else{
                truelen += 1;
            }
        }
        return truelen;
    }
    function cutString(str, leng){//按字节长度截取字符串，返回substr截取位置
        var len = str.length, tlen = len, nlen = 0;
        for(var x = 0; x < len; x++){
            if(str.charCodeAt(x) > 128){
                if(nlen + 2 < leng){
                    nlen += 2;
                }else{
                    tlen = x;
                    break;
                }
            }else{
                if(nlen + 1 < leng){
                    nlen += 1;
                }else{
                    tlen = x;
                    break;
                }
            }
        }
        return tlen;
    }
    for(var i = 1; getTrueLength(text) > 0; i++){
        var tl = cutString(text, bytelength);
        ctx_2d.fillText(text.substr(0, tl).replace(/^\s+|\s+$/, ""), startleft, (i-1) * lineheight + starttop);
        text = text.substr(tl);
    }
}
// 图片保存
function saveImageInfo (id)
{
    var mycanvas = document.getElementById(id);
    var image    = mycanvas.toDataURL("image/png");
    var w=window.open('about:blank','image from canvas');
    w.document.write("<img src='"+image+"' alt='from canvas'/>");
}

function saveAsLocalImage (id) {
    var myCanvas = document.getElementById(id);
    var image = myCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    window.location.href=image; // it will save locally
}
var canvasStack=[];
$(document).ready(function () {
    document.ondragstart = function () {
        return false;
    };

    //ie禁止拖拽
    document.onselectstart = function () {
        return false;
    };//ie禁止选定
    textValue='';
    textLength=22;
    textHeight=20;
    canvas_size = {x: $("#canvas").width(), y: $("#canvas").height()};
    canvas_offset = {x: $("#canvas")[0].offsetLeft, y: $("#canvas")[0].offsetTop};
    origin = {x: 0, y: 0}
    end = {x: 0, y: 0}
    type = 0;
    drawable = false;
    color_changeable = false;

    canvas = document.getElementById("canvas");
    canvas2 = document.getElementById("canvas2");

    context = canvas.getContext('2d');
    context.strokeStyle = "#00aeef";
    fill_canvas("#ffffff");
    context.lineWidth = 1;
    context2 = canvas2.getContext('2d');
    context2.strokeStyle = "#00aeef";
    context2.lineWidth = 1;
    canvas_rgb = {r: 1, g: 1, b: 1};

    $(canvas2).bind('mousedown', function (event) {

        drawable = true;
        origin.x = event.clientX - canvas_offset.x;
        origin.y = event.clientY - canvas_offset.y;
        if (type == 51) {
            textInput(textValue,origin.x-5,origin.y-15,context2,context)
        }
        if(type==0||type==2||type==5){
            console.log('x')
            Csave('canvas');
        }

    });
    $(canvas2).bind('mouseup', function (event) {

        canvas_backup = context.getImageData(0, 0, canvas.width, canvas.height);
    });
    $(document).bind('mouseup', function (event) {

        if ((type == 1 || type == 3 || type == 4 || type == 41 || type == 51|| type == 61) && drawable == true) {
            drawable = false;
            context2.clearRect(0, 0, canvas_size.x, canvas_size.y);
            end.x = event.clientX - canvas_offset.x;
            end.y = event.clientY - canvas_offset.y;
            console.log('3')
            Csave('canvas');
            draw(context);
        } else{
            //Csave('canvas');
            drawable = false;
        }

        color_changeable = false;
    });
    $(document).bind("mousemove", function (event) {
        if (drawable == false){
            return;
        }
        if (type == 0) {
            end.x = event.clientX - canvas_offset.x;
            end.y = event.clientY - canvas_offset.y;

            draw(context);
            origin.x = end.x;
            origin.y = end.y;
        } else if (type == 1 || type == 3 || type == 4 || type == 41 || type == 5|| type == 61) {
            end.x = event.clientX - canvas_offset.x;
            end.y = event.clientY - canvas_offset.y;
            if (type == 5) {
                fill_canvas('#ffffff', end.x - 10, end.y - 10, 20, 20);
                return;
            }
            else {
                context2.clearRect(0, 0, canvas_size.x, canvas_size.y);
            }
            draw(context2);
        }
        else if (type == 2) {
            end.x = event.clientX - canvas_offset.x;
            end.y = event.clientY - canvas_offset.y;

            draw(context);
        }
    });

    var img = new Image();
    img.src = "img/color.bmp";
    $(img).bind("load", function () {
        canvas_color = document.getElementById("canvas_color");
        context3 = canvas_color.getContext('2d');
        context3.drawImage(this, 0, 0, this.width, this.height);
        canvas_color_data = context3.getImageData(0, 0, canvas_color.width, canvas_color.height);
        $(canvas_color).bind("mousedown", function (event) {
            var idx = ((event.clientX - canvas_color.offsetLeft - 1) + (event.clientY - canvas_color.offsetTop - 1) * canvas_color_data.width) * 4;
            var r = canvas_color_data.data[idx + 0];
            var g = canvas_color_data.data[idx + 1];
            var b = canvas_color_data.data[idx + 2];
            $("#color_span").css("background-color", "rgb(" + r + "," + g + "," + b + ")");
            change_attr(-1, -1, "rgb(" + r + "," + g + "," + b + ")");
            color_changeable = true;
        });
        $(canvas_color).bind("mousemove", function (event) {
            if (color_changeable == false)
                return;
            var x = event.clientX - canvas_color.offsetLeft - 1;
            if (x >= canvas_color_data.width || x < 0)
                return;
            var y = event.clientY - canvas_color.offsetTop - 1;
            if (y >= canvas_color_data.height || y < 0)
                return;
            var idx = (x + y * canvas_color_data.width) * 4;
            var r = canvas_color_data.data[idx + 0];
            var g = canvas_color_data.data[idx + 1];
            var b = canvas_color_data.data[idx + 2];
            $("#color_span").css("background-color", "rgb(" + r + "," + g + "," + b + ")");
            change_attr(-1, -1, "rgb(" + r + "," + g + "," + b + ")");
        });
    });

    $("#close_window").bind("click", function () {
        $("#forbiden_back").fadeOut(300);
        $("#pic_url").val('');
    });

    $("#open_pic").bind("click", function () {
        $("#forbiden_back").fadeOut(300);
        open_img($("#pic_url").val());
        $("#pic_url").val('');
    });

    open_img("img/5.jpg");

    $("#size_bar").bind("mousedown", function (event) {
        var thumb = $("#size_thumb");
        var main_w = $(this).width();
        var mainLeft = $(this).offset().left;
        thumb.css("left", event.clientX - mainLeft - thumb.width() / 2 + "px");
        $("#size_span").html(Math.ceil($(thumb).position().left / main_w * 5) + 1);
        change_attr(-1, $("#size_span").html(), -1);
        $(document).bind("mousemove", size_bar_move);
        $(document).bind("mouseup", function unbind(event) {
            $(document).unbind("mousemove", size_bar_move);
            $(document).unbind("mouseup", unbind);
        });
    });

    $("#r_channel_bar").bind("mousedown", function (event) {
        var thumb = $("#r_channel_thumb");
        var main_w = $(this).width();
        var mainLeft = $(this).offset().left;
        thumb.css("left", event.clientX - mainLeft - thumb.width() / 2 + "px");
        $(document).bind("mousemove", {c: "r"}, channel_bar_move);
        $(document).bind("mouseup", function unbind(event) {
            canvas_rgb.r = 0.5 + $(thumb).position().left / main_w;
            change_channel();
            $(document).unbind("mousemove", channel_bar_move);
            $(document).unbind("mouseup", unbind);
        });
    });
    $("#g_channel_bar").bind("mousedown", function (event) {
        var thumb = $("#g_channel_thumb");
        var main_w = $(this).width();
        var mainLeft = $(this).offset().left;
        thumb.css("left", event.clientX - mainLeft - thumb.width() / 2 + "px");
        $(document).bind("mousemove", {c: "g"}, channel_bar_move);
        $(document).bind("mouseup", function unbind(event) {
            canvas_rgb.g = 0.5 + $(thumb).position().left / main_w;
            change_channel();
            $(document).unbind("mousemove", channel_bar_move);
            $(document).unbind("mouseup", unbind);
        });
    });
    $("#b_channel_bar").bind("mousedown", function (event) {
        var thumb = $("#b_channel_thumb");
        var main_w = $(this).width();
        var mainLeft = $(this).offset().left;
        thumb.css("left", event.clientX - mainLeft - thumb.width() / 2 + "px");
        $(document).bind("mousemove", {c: "b"}, channel_bar_move);
        $(document).bind("mouseup", function unbind(event) {
            canvas_rgb.b = 0.5 + $(thumb).position().left / main_w;
            change_channel();
            $(document).unbind("mousemove", channel_bar_move);
            $(document).unbind("mouseup", unbind);
        });
    });

});
function textInput(value,l,t,canvas2,canvas) {
    var x = $('<input type="text"  class="bi divWrap">').appendTo($('#main'));
    x.css('left',l)
    x.css('top',t)
    x.keypress(function (event) {
        if (event.which == 13) {
            var y = x.val();
            console.log(y)
            value=y;
            canvas.fillStyle = "white";
            canvas2.fillStyle = "white";
            Csave('canvas');
            writeTextOnCanvas(canvas,textHeight,textLength,y,parseInt(x.css('left'))+3,parseInt(x.css('top'))+21)
            //writeTextOnCanvas(canvas2,textHeight,textLength,y,parseInt(x.css('left'))+3,parseInt(x.css('top'))+21)
            //canvas.fillText(y,parseInt(x.css('left'))+3,parseInt(x.css('top'))+21)
            //canvas2.fillText(y,parseInt(x.css('left'))+3,parseInt(x.css('top'))+21)
            x.remove();


        }
    });
    x.dragDiv()
    x.on('click',function(e){
        e.preventDefault();
    })


}

function Csave(id){
    var canvas = document.getElementById(id);
    var context = canvas.getContext('2d');
    var tmp = context.getImageData(0,0,canvas.width,canvas.height);
    canvasStack.push(tmp)
}
function Crestore(id){
    var canvas = document.getElementById(id);
    var context = canvas.getContext('2d');
    if(canvasStack.length>0){
        var tmp = canvasStack.pop();
        context.putImageData(tmp,0,0);
        //document.getElementById('canvas3').getContext('2d').putImageData(tmp,0,0);
    }

}

function size_bar_move(e) {
    var thumb = $("#size_thumb");
    var main_w = $("#size_bar").width();
    var mainLeft = $("#size_bar").offset().left;
    if (e.clientX - mainLeft < 0)
        thumb.css("left", -thumb.width() / 2 + "px");
    else if (e.clientX - mainLeft > main_w)
        thumb.css("left", main_w - thumb.width() / 2 + "px");
    else
        thumb.css("left", e.clientX - mainLeft - thumb.width() / 2 + "px");
    $("#size_span").html(Math.ceil($(thumb).position().left / main_w * 5) + 1);
    change_attr(-1, $("#size_span").html(), -1);
}

function channel_bar_move(e) {
    var c = e.data.c;
    var thumb = $("#" + c + "_channel_thumb");
    var main_w = $("#" + c + "_channel_bar").width();
    var mainLeft = $("#" + c + "_channel_bar").offset().left;
    if (e.clientX - mainLeft < 0)
        thumb.css("left", -thumb.width() / 2 + "px");
    else if (e.clientX - mainLeft > main_w)
        thumb.css("left", main_w - thumb.width() / 2 + "px");
    else
        thumb.css("left", e.clientX - mainLeft - thumb.width() / 2 + "px");
}

function draw(context) {

    if (type == 0 || type == 1 || type == 2) {
        context.beginPath();
        context.moveTo(origin.x, origin.y);
        context.lineTo(end.x, end.y);
        context.stroke();
    } else if (type == 3) {
        var k = ((end.x - origin.x) / 0.75) / 2,
            w = (end.x - origin.x) / 2,
            h = (end.y - origin.y) / 2,
            x = (end.x + origin.x) / 2,
            y = (end.y + origin.y) / 2;
        context.beginPath();
        context.moveTo(x, y - h);
        context.bezierCurveTo(x + k, y - h, x + k, y + h, x, y + h);
        context.bezierCurveTo(x - k, y + h, x - k, y - h, x, y - h);
        context.closePath();
        context.stroke();
    } else if (type == 4) {
        context.beginPath();
        context.rect(origin.x, origin.y, end.x - origin.x, end.y - origin.y);
        context.stroke();
    } else if (type == 41) {
        context.beginPath();
        context.rect(end.x - 10, end.y - 10, 40, 40);
        context.stroke();
    }else if (type == 61) {
        context.beginPath();
        end.y=end.y+90;
        context.moveTo(end.x - 10, end.y - 10);
        context.lineTo(end.x + 80, end.y - 10);
        context.lineTo(end.x + 90, end.y );
        context.lineTo(end.x + 100, end.y - 10);
        context.lineTo(end.x + 130, end.y - 10);
        context.lineTo(end.x + 130, end.y - 100);
        context.lineTo(end.x - 10, end.y - 100);
        context.closePath();
        context.stroke();
    }

}

function change_attr(tp, sz, clr) {
    if (tp != -1)
        type = tp;
    if (clr != -1) {
        context.strokeStyle = clr;
        context2.strokeStyle = clr;
    }
    if (sz != -1) {
        context.lineWidth = sz;
        context2.lineWidth = sz;
    }
}

function clear_canvas() {
    context.clearRect(0, 0, canvas_size.x, canvas_size.y);
}

function fill_canvas(col, orix, oriy, w, h) {

    context.fillStyle = col;
    context.fillRect(orix, oriy, w, h);
}

function gaussian() {
    Csave('canvas');
    var pi = 3.141592654,//get gaussian_array
        e = 2.718281828459,
        g = 2,
        gaussian_array = new Array(),
        temp = 0;
    for (var x = 0; x < 2 * g + 1; x++) {
        gaussian_array[x] = new Array();
        for (var y = 0; y < 2 * g + 1; y++) {
            gaussian_array[x][y] = Math.pow(e, -((x - g) * (x - g) + (y - g) * (y - g)) / (2 * g * g)) / (2 * pi * g * g);
            temp += gaussian_array[x][y];
        }
    }
    for (var x = 0; x < 2 * g + 1; x++) {
        for (var y = 0; y < 2 * g + 1; y++) {
            gaussian_array[x][y] /= temp;
        }
    }

    var can_data = context.getImageData(0, 0, canvas.width, canvas.height);
    var can_data2 = context.getImageData(0, 0, canvas.width, canvas.height);

    for (var i = g; i < canvas.width - g - 1; i++) {
        for (var j = g; j < canvas.height - g - 1; j++) {
            var idx = (i + j * can_data2.width) * 4;
            can_data2.data[idx + 0] = get_gaussian_average(can_data, g, gaussian_array, 0, i, j);
            can_data2.data[idx + 1] = get_gaussian_average(can_data, g, gaussian_array, 1, i, j);
            can_data2.data[idx + 2] = get_gaussian_average(can_data, g, gaussian_array, 2, i, j);
        }
    }
    context.putImageData(can_data2, 0, 0);
    canvas_backup = context.getImageData(0, 0, canvas.width, canvas.height);
}

function change_channel() {
    Csave('canvas');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var can_data = context.getImageData(0,0,canvas.width,canvas.height);
    //document.getElementById('canvas3').getContext('2d').putImageData(can_data,0,0);
   // can_data = context.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < canvas.width; i++) {
        for (var j = 0; j < canvas.height; j++) {
            var idx = (i + j * can_data.width) * 4;
            can_data.data[idx + 0] = can_data.data[idx + 0] * canvas_rgb.r;
            can_data.data[idx + 1] = can_data.data[idx + 1] * canvas_rgb.g;
            can_data.data[idx + 2] = can_data.data[idx + 2] * canvas_rgb.b;
        }
    }
    context.putImageData(can_data, 0, 0);
}

function get_gaussian_average(can_data, g, gaussian_array, channel, x, y) {
    var t = 0;
    for (var i = 0; i < 2 * g + 1; i++) {
        for (var j = 0; j < 2 * g + 1; j++) {
            var idx = (x + i - g + (y + j - g) * can_data.width) * 4;
            t += can_data.data[idx + channel] * gaussian_array[i][j];
        }
    }
    return t;
}

function open_img(url) {
    var img = new Image();
    img.src = url;
    $(img).bind("load", function () {
        fill_canvas('#ffffff', 0, 0, canvas_size.x, canvas_size.y);
        context.drawImage(this, -100, -100, this.width, this.height);
        canvas_backup = context.getImageData(0, 0, canvas.width, canvas.height);
    });
}

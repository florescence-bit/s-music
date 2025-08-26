// created by SAN :>
let H, W, san, {sin, cos, PI, hypot, random, round} = Math;



const Loop = () => {
    san.clearRect(0, 0, W, H);
    san.fillStyle = "rgba(0,200,300,.5)";
   
    webkitRequestAnimationFrame(Loop);
}
const init = () => {
    document.body.style.margin = 0;
    let c = document.createElement("canvas");
    document.body.appendChild(c);
    c.style.position = "fixed";
    c.style.background = "black";
    c.style.width = "100vw";
    c.style.height = "100vh";
    c.height = H = innerHeight*2;
    c.width = W = innerWidth*2;
    san = c.getContext('2d'); 
    
    window.onresize = () => {
        c.height = H = innerHeight * 2;
        c.width = W = innerWidth * 2;
    }

    c.ontouchstart = Hold;
    c.ontouchmove = Drag;
    c.ontouchend = undefined;
    Loop();
};
onload = init;
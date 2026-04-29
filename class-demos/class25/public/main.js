window.onload = () => {
    const s = (sketch) => {
        let x = 100;
        let y = 100;

        sketch.setup = () => {
            sketch.createCanvas(400, 400);
        }
        sketch.draw = () => {
            sketch.background(220);
            sketch.fill(255, 0, 0);
            noStroke();
            sketch.rect(x,sketch.height/2, 10);
        }
    }
    let mySketch1 = new p5(s, 'sketch1');
    //in thisv er not declaringb variable but putitng entire sketch in anonymous function, we can also do it like this:
    let mySketch2 = newp5((sketch) => {
        sketch.setup = () => {
            sketch.createCanvas(400, 400);
            sketch.background(0, 255, 0);
        }
    }, 'sketch2');
};
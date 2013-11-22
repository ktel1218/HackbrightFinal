struct METABALL { 
    float _x, _y;
    float _radius;

    METABALL(float startx, float starty, float radius){
        _x = startx;
        _y = starty; 
        _radius = radius; 
    } 

    float Equation(float x, float y) {
        return (_radius / sqrt( (x-_x)*(x-_x) + (y-_y)*(y-_y) ) );
    } 
}; 

const MAX_METABALLS = 15; 
METABALL *ballList[MAX_METABALLS]; 
// A list of Metaballs in our world 
//Now, assuming that you already have your graphics library of choice up and running, we jump straight into the core of the implementation, which is just as simple as applying the algorithm discussed:

const float MIN_THRESHOLD = 0.99f; 
const float MAX_THRESHOLD = 1.01f; 
// Minimum and maximum threshold for an isosurface ... 


void draw_metaballs() { 
    // Value to act as a summation of all Metaballs' fields applied to this particular pixel
    float sum; 
    // Iterate over every pixel on the screen 
    for(int y = 0; y < SCREEN_HEIGHT; y++) { 
        for(int x = 0; x < SCREEN_WIDTH; x++) { 
            // Reset the summation 
            sum = 0;
            // Iterate through every Metaball in the world 
            for(int i = 0; i < MAX_METABALLS && ballList[i] != NULL; i++) { 
                sum += ballList[i]->Equation(x,y); 
            } 
         // Decide whether to draw a pixel 
         if(sum >= MIN_THRESHOLD && sum <= MAX_THRESHOLD) {
         draw_pixel(x, y, COLOR_WHITE); }
    } 
} 
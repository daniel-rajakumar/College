import math

class Point:
    # (a) A constructor which is passed two integers, consider whether to use default values
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y
    
    # (b) python doesn't support overload 

    # (c) A translate function which is passed a Point and changes the coordinates using the passed in Point.
    def translate(self, other):
        self.x += other.x # x' = x + a
        self.y += other.y # y' = y + b

    # (d) A move_to function. This function is passed a Point P and moves the original point to P
    def move_to(self, other):
        self.x = other.x
        self.y = other.y

    # (e) A rotate function which is passed an angle and rotates the point by that amount.
    def rotate(self, th):
        rad = math.radians(th)
        x = round(self.x * math.cos(rad) - self.y * math.sin(rad))
        y = round(self.x * math.sin(rad) + self.y * math.cos(rad))
        self.x, self.y = x, y

    # (f) A distance function that gives the distance between two points. The formula for the distance between (x,y) and (x' ,y') is...
    def distance(self, other):
        return math.sqrt((other.x - self.x)**2 + (other.y - self.y)**2)

    # (g) A function that determines if a point is on a given line. The information for the line would be passed in as a slope and a specific point on the line
    def is_on_line(self, slope, line_point):
        return (self.y - line_point.y) == slope * (self.x - line_point.x)

    # (h) Functions to access the x and y coordinates. There should be three such functions. One that returns the xcoordinate, one that returns the y-coordinate and one that returns the Point.
    def get_x(self):
        return self.x

    def get_y(self):
        return self.y

    def get_point(self):
        return self

    # (i)) Functions to modify the x and y coordinates.
    def set_x(self, new_x):
        self.x = new_x

    def set_y(self, new_y):
        self.y = new_y

    # (j) Python does not support overloading 

    # (k) A function called invert that switches the x and y coordinates.
    def invert(self):
        self.x, self.y = self.y, self.x

    # (l) A function that is passed two points and finds the midpoint between them
    @staticmethod
    def midpoint(p1, p2):
        return Point((p1.x + p2.x) // 2, (p1.y + p2.y) // 2)

    # (m) A function to convert the point (x, y) into polar coordinates (r, θ)
    def to_polar(self):
        r = math.sqrt(self.x**2 + self.y**2)
        theta = math.degrees(math.atan2(self.y, self.x))
        return r, theta

    # (n)  Overload the input and output operators.
    def __str__(self):
        return f"({self.x}, {self.y})"

# Write a main program that tests each of these functions
p1 = Point(3, 4)
p2 = Point(1, 2)

print(f"p1: {p1}")
print(f"p2: {p2}")

p1.translate(p2)
print(f"translate -> {p1}")

p1.move_to(p2)
print(f"move_to -> {p1}")

p1.rotate(45)
print(f"after rotate -> {p1}")
print(f"distance between p1 & p2 -> {p1.distance(p2)}")
print(f"is p1 on line with slope 1 -> p2 -> {p1.is_on_line(1, p2)}")

p1.invert()
print(f"invert -> {p1}")

mid = Point.midpoint(p1, p2)
print(f"mid -> {mid}")

polar = p1.to_polar()
print(f"polar cord: r = {polar[0]}, theta = {polar[1]}")

################################
### DIF BETWEEN PYTHON & C++ ###
################################
# - Python does not support operator overloading for example “+=“ like c++
# - Python does not have copy constructor like c++
# - Python is dynamically typed while C++ is statically typed. 
# - Python does have the concept of constant. 

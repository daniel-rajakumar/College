#include <iostream>
#include <cmath>
using namespace std;

class Point {
private:
    int x, y;

public:
    // (a) A constructor which is passed two integers, consider whether to use default values
    explicit Point(const int x = 0, const int y = 0) {
        this->x = x;
        this->y = y;
    }

    // (b) A copy constructor.
    Point(const Point &p) {
        this->x = p.x;
        this->y = p.y;
    }

    // (c) A translate function which is passed a Point and changes the coordinates using the passed in Point.
    Point& operator+=(const Point &p) {
        this->x += p.x; // x' = x + a
        this->y += p.y; // y' = y + b
        return *this;
    }

    // (d) A move_to function. This function is passed a Point P and moves the original point to P
    void move_to(const Point &p) {
        this->x = p.x;
        this->y = p.y;
    }

    // (e) A rotate function which is passed an angle and rotates the point by that amount.
    void rotate(const double th) {
        const double rad = th * M_PI / 180.0; // Convert degrees to radians
        const int newX = round(this->x * cos(rad) - this->y * sin(rad));
        const int newY = round(this->x * sin(rad) + this->y * cos(rad));
        this->x = newX;
        this->y = newY;
    }

    // (f) A distance function that gives the distance between two points. The formula for the distance between (x,y) and (x' ,y') is...
    double distance(const Point &p) const {
        return sqrt(pow(p.x - this->x, 2) + pow(p.y - this->y, 2));
    }

    // (g) A function that determines if a point is on a given line. The information for the line would be passed in as a slope and a specific point on the line
    bool is_on_line(const double slope, const Point &linePoint) const {
        return (this->y - linePoint.y) == slope * (this->x - linePoint.x);
    }

    // (h) Functions to access the x and y coordinates. There should be three such functions. One that returns the xcoordinate, one that returns the y-coordinate and one that returns the Point.
    int get_x() const { return this->x; }
    int get_y() const { return this->y; }
    Point get_point() const { return *this; }

    // (i)) Functions to modify the x and y coordinates.
    void set_x(const int newX) { this->x = newX; }
    void set_y(const int newY) { this->y = newY; }

    // (j) Overload the assignment operator.
    Point& operator=(const Point &p) {
        if (this != &p) {
            this->x = p.x;
            this->y = p.y;
        }
        return *this;
    }

    // (k) A function called invert that switches the x and y coordinates.
    void invert() {
        const int temp = this->x;
        this->x = this->y;
        this->y = temp;
    }

    // (l) A function that is passed two points and finds the midpoint between them
    static Point midpoint(const Point &p1, const Point &p2) {
        const int x = (p1.x + p2.x) / 2;
        const int y = (p1.y + p2.y) / 2;
        return Point(x, y);
    }

    // (m) A function to convert the point (x, y) into polar coordinates (r, θ)
    pair<double, double> to_polar() const {
        double r = sqrt(this->x * this->x + this->y * this->y);
        double t = atan2(this->y, this->x) * 180 / M_PI;
        return {r, t};
    }

    // (n)  Overload the input and output operators.
    friend ostream& operator<<(ostream &os, const Point &p) {
        os << "(" << p.x << ", " << p.y << ")";
        return os;
    }
    friend istream& operator>>(istream &is, Point &p) {
        is >> p.x >> p.y;
        return is;
    }
};

int main() {
    // Write a main program that tests each of these functions
    Point p1(3, 4);
    const Point p2(1, 2);

    cout << "p1: " << p1 << endl;
    cout << "p2: " << p2 << endl;

    cout << "After translate -> " << (p1 += p2) << endl;

    p1.move_to(p2);
    cout << "move_to -> " << p1 << endl;

    p1.rotate(45);
    cout << "after rotate -> " << p1 << endl;
    cout << "distance between p1 & p2 -> " << p1.distance(p2) << endl;
    cout << "is p1 on line with slope 1 -> p2 -> " << p1.is_on_line(1, p2) << endl;

    p1.invert();
    cout << "invert -> " << p1 << endl;

    const Point mid = Point::midpoint(p1, p2);
    cout << "mid -> " << mid << endl;

    auto [fst, snd] = p1.to_polar();
    cout << "polar cord: r = " << fst << ", theta = " << snd << endl;

    return 0;
}
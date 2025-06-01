#include <iostream>
using namespace std;

class A {
public:
 A()             { cout << "A"; }
};

class B: public virtual A {
public:
 B()             { cout << "B"; }
};

class C: public virtual A {
public:
 C()             { cout << "C"; }
};

class D: public B, public C {
public:
 D()             { cout << "D"; }
 D(const D &)    { cout << "d"; }
};

int main()
{
 D d1;        // default-construct d1
 D d2(d1);    // copy-construct d2 from d1
}

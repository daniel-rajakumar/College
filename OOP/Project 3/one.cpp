#include <iostream>
using namespace std;

class A {
public:
    void f() {
        cout << "A::f()\n";
    }
    virtual void h() {
        cout << "A::h()\n";
    }
};

class B : public virtual A {
public:
    void f() {
        cout << "B::f()\n";
    }
};

class C : public B {
public:
    void g() {
        cout << "C::g()\n";
    }
    void h() override {
        cout << "C::h()\n";
    }
};

class D : public C, public virtual A {
public:
    void g() {
        cout << "D::g()\n";
    }
    void h() override {
        cout << "D::h()\n";
    }
};

int main() {
    A *pa = new D;
    pa->f();  // A::f() → because f() is not virtual
    pa->h();  // D::h() → h() is virtual & resolved at runtime

    B *pb = new B;
    pb->f();  // B::f() → B overrides f()
    pb->h();  // A::h() → B does NOT override h(), so A::h() is called


    C *pc = new C;
    pc->f();  // B::f() → inherited from B & C didn’t override
    pc->h();  // C::h() → C overrides h()

    D *pd = new D;
    pd->f();  // B::f() → inherited from C → B
    pd->g();  // D::g() → D overrides g()
    pd->h();  // D::h() → D overrides h()

    return 0;
}

/** output:
 *
A::f()
D::h()
B::f()
A::h()
B::f()
C::h()
B::f()
D::g()
D::h()

 */
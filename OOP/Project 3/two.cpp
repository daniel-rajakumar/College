#include <iostream>
using namespace std;

struct Base {
    Base() { cout << "A Base is born\n"; }
    virtual ~Base() { cout << "A Base dies\n"; } // FIX: Made destructor virtual to ensure proper cleanup when deleting through base pointer
    void func() { cout << "Base::func()\n"; }
    virtual void vfunc() { cout << "Base::vfunc()\n"; }
};
struct Der: public Base {
    Der() { cout << "A Der is born\n"; }
    ~Der() { cout << "A Der dies\n"; }
    void func() { cout << "Der::func()\n"; }
    virtual void vfunc() { cout << "Der::vfunc()\n"; }
};
int main() {
    Base *bp;
    bp = new Der;
    bp->func();
    bp->vfunc();
    delete bp;
}


/** OUTPUT:

a)    A Base is born
    A Der is born
    Base::func()
    Der::vfunc()
    A Base dies


b) Does the output seem correct? If not, how would you fix the problem.
Nope, we cac fix it by adding virtual to the base class.
 * /
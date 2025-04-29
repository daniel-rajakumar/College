#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <iomanip>
using namespace std;

/**

    You can solve the following problem in C++ or Python. Write an abstract base class called
    Employee that contains a name and social security number(both are strings) together with

    appropriate member functions
    .
     Also include a pure virtual function print() that prints out the

    name and social security number.

*/

class Employee {
protected:
    string name;
    string ssn;

public:
    Employee(const string &name, const string &ssn) : name(name), ssn(ssn){}

    virtual ~Employee() = default;

    string getSSN() const { return ssn; }

    virtual void print() const = 0; // pure virtual
};

/**
    Next, derive (from Employee) a class Hourly that adds data members wage (which is the hourly
    wage) and hours (which is the number of hours worked that week). Write the appropriate
    member functions, including a print() function prints out name, social security number, wage,
    hours, and money earned that week (note: if hours > 40, the employee gets paid time and a half
    for the hours over 40).
 */
class Hourly : public Employee {
private:
    double wage;
    double hours;

public:
    Hourly(const string& name, const string& ssn, double wage, double hours)
        : Employee(name, ssn), wage(wage), hours(hours) {}

    void print() const override {
        double earned;

        if (hours <= 40) {
            earned = wage * hours; // Regular pay
        } else {
            const double overtime = hours - 40;
            earned = (40 * wage) + (overtime * wage * 1.5); // Regular + Overtime pay
        }

        cout << fixed << setprecision(2);
        cout << "Hourly Employee: " << name << ", SSN: " << ssn
             << ", Wage: $" << wage << "/hr"
             << ", Hours: " << hours
             << ", Earned: $" << earned << "\n";
    }
};

/**

    Next, derive (from Employee) a class Salaried that adds a data member yearly_salary. The print()
    function prints out name, social security number, yearly salary, and salary for that week (which
    is yearly/52).

 */
class Salaried : public Employee {
private:
    double yearly_salary;

public:
    Salaried(const string& name, const string& ssn, double salary)
        : Employee(name, ssn), yearly_salary(salary) {}

    void print() const override {
        double weeklySalary = yearly_salary / 52;

        cout << fixed << setprecision(2);
        cout << "Salaried Employee: " << name << ", SSN: " << ssn
             << ", Yearly Salary: $" << yearly_salary
             << ", Weekly Pay: $" << weeklySalary << "\n";
    }
};

/**
    Finally, create a class Roster that can hold a variable number of employees. This class should
    have operations to add or delete an employee and print out the entire roster of employees.
    Duplicate employees should not be allowed.
 */
class Roster {
private:
    vector<shared_ptr<Employee> > employees;

public:
    void addEmployee(const shared_ptr<Employee>& emp) {
        for (const auto& e : employees) {
            if (e->getSSN() == emp->getSSN()) {
                cout << "Duplicate SSN found. Employee not added.\n";
                return;
            }
        }
        employees.push_back(emp);
    }

    void removeEmployee(const string& ssn) {
        for (auto it = employees.begin(); it != employees.end(); ++it) {
            if ((*it)->getSSN() == ssn) {
                employees.erase(it);
                cout << "Employee removed.\n";
                return;
            }
        }
        cout << "Employee with SSN " << ssn << " not found.\n";
    }

    void printAll() const {
        cout << "\n--- Employee Roster ---\n";
        for (const auto& e : employees) {
            e->print();
        }
    }
};

int main() {
    Roster roster;

    roster.addEmployee(make_shared<Hourly>("Alice", "123-45-6789", 20.0, 42));
    roster.addEmployee(make_shared<Salaried>("Bob", "987-65-4321", 52000));
    roster.addEmployee(make_shared<Hourly>("Charlie", "123-45-6789", 18.0, 38)); // Duplicate SSN

    roster.printAll();
    roster.removeEmployee("987-65-4321");
    roster.printAll();

    return 0;
}



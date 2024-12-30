#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <map>

using namespace std;

int main(int argc, char* argv[]) {
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <filename>" << endl;
        return 1;
    }

    ifstream inputFile(argv[1]);
    if (!inputFile) {
        cerr << "Unable to open file: " << argv[1] << endl;
        return 1;
    }

    map<int, int> word_length_counts;
    string line;

    while (getline(inputFile, line)) {
        istringstream line_iss(line);
        string word;

        while (line_iss >> word) 
            word_length_counts[word.size()]++;
    }

    inputFile.close();

    for (auto& p : word_length_counts) 
        cout << "There is a total of " << p.second << " words with a length of " << p.first << "!" << endl;

    return 0;
}

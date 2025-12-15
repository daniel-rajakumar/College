#pragma once
#include <string>
#include "SaveGame.h"

class Serializer
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    Serializer() = delete;

    // destructor
    ~Serializer() = delete;

    // selector(s)
    static bool loadFromFile(const std::string& filename, SaveGame& outSave);
    static bool saveToFile(const std::string& filename, const SaveGame& save);

    // mutator(s)
    // (none)

    // utility functions
};

cmake_minimum_required(VERSION 3.30)
project(C__)

set(CMAKE_CXX_STANDARD 20)

add_executable(C__ "Source Files/main.cpp"
        "Source Files/Player.cpp"
        "Header Files/Player.h"
        "Source Files/Dice.cpp"
        "Header Files/Dice.h"
        "Source Files/Computer.cpp"
        "Header Files/Computer.h"
        "Source Files/Human.cpp"
        "Header Files/Human.h"
        "Source Files/Tournament.cpp"
        "Header Files/Tournament.h"
        "Source Files/Game.cpp"
        "Header Files/Game.h"
        "Source Files/Serializer.cpp"
        "Header Files/Serializer.h")

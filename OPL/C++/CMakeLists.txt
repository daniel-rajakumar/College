cmake_minimum_required(VERSION 3.30)
project(C__)

set(CMAKE_CXX_STANDARD 20)

add_executable(C__ main.cpp
        Player.cpp
        Player.h
        Dice.cpp
        Dice.h
        Computer.cpp
        Computer.h
        Human.cpp
        Human.h
        Tournament.cpp
        Tournament.h
        Game.cpp
        Game.h
        Serializer.cpp
        Serializer.h)

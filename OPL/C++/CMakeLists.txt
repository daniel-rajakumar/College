cmake_minimum_required(VERSION 3.31)
project(c__)

set(CMAKE_CXX_STANDARD 20)

add_executable(c__ "main.cpp"
        "Source Files/Player.cpp"
        "Header Files/Player.h"
        "Source Files/Computer.cpp"
        "Header Files/Computer.h"
        "Source Files/Human.cpp"
        "Header Files/Human.h"
        "Source Files/Tournament.cpp"
        "Header Files/Tournament.h"
        "Source Files/Board.cpp"
        "Header Files/Board.h"
        "Source Files/BoardView.cpp"
        "Header Files/BoardView.h"
        "Source Files/Round.cpp"
        "Header Files/Round.h"
        "Header Files/Tournament.h"
        "Source Files/Tournament.cpp"
        "Header Files/Human.h"
        "Source Files/Human.cpp"
        "Header Files/TextUI.h")

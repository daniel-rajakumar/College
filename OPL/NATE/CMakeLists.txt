cmake_minimum_required(VERSION 3.31)
project(NATE)

set(CMAKE_CXX_STANDARD 14)

include_directories(.)
include_directories(Header)
include_directories(Source)

add_executable(NATE
        Header/Board.h
        Header/BoardView.h
        Header/ComputerPlayer.h
        Header/Constants.h
        Header/HumanPlayer.h
        Header/Move.h
        Header/Player.h
        Header/PocketCoord.h
        Header/Round.h
        Header/SaveGame.h
        Header/ScoringEngine.h
        Header/Serializer.h
        Header/Stone.h
        Header/Tournament.h
        Source/3Stones.cpp
        Source/Board.cpp
        Source/BoardView.cpp
        Source/ComputerPlayer.cpp
        Source/HumanPlayer.cpp
        Source/Move.cpp
        Source/Player.cpp
        Source/PocketCoord.cpp
        Source/Round.cpp
        Source/ScoringEngine.cpp
        Source/Serializer.cpp
        Source/Tournament.cpp)

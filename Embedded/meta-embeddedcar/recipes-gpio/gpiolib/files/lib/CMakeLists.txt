#add include to directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../include)
#set the proper macros
set(LIBRARY_NAME gpiolib)
set(SRC_FILES gpio_lib.c)
set(INCLUDE_FILES ${CMAKE_CURRENT_SOURCE_DIR}/../include/gpio_lib.h)
#add the library
add_library(${LIBRARY_NAME} SHARED ${SRC_FILES} ${INCLUDE_FILES})

# Link pthread library
target_link_libraries(${LIBRARY_NAME} pthread)

# Set library version
set_target_properties(${LIBRARY_NAME} PROPERTIES
    VERSION 1.0.0
    SOVERSION 1)

#installing the library
install (TARGETS ${LIBRARY_NAME} 
    LIBRARY DESTINATION lib)
install (FILES ${INCLUDE_FILES} DESTINATION include)
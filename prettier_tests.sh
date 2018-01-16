#!/bin/bash
tests=$(find './tests/' -regex ".*\.java")

test_folder="prettier_tests"
rm -rf $test_folder
mkdir $test_folder

for file in $files; do
  array=(${file//\// })
  length=${#array[@]}
  test_file=${array[length-1]}
  test_file_folder=${array[length-2]}
  cp_path=$test_folder/$test_file_folder/$test_file
  yarn prettier $file | sed '1,2d' | sed -n -e :a -e '1,2!{P;N;D;};N;ba' > $cp_path
  echo $cp_path
done;
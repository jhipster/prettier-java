#!/bin/bash

test_folder="tests"
rm -rf $test_folder/prettier*

tests=$(find './tests/' -regex ".*\.java")


for file in $tests; do
  array=(${file//\// })
  length=${#array[@]}
  test_file=${array[length-1]}
  test_file_folder="prettier_${array[length-2]}"
  cp_path=$test_folder/$test_file_folder/$test_file
  mkdir -p $test_folder/$test_file_folder
  echo $cp_path
  yarn prettier $file | sed '1,1d' | sed -n -e :a -e '1,1!{P;N;D;};N;ba' > $cp_path
  echo -e 'run_spec(__dirname, ["java"]);' > $test_folder/$test_file_folder/jsfmt.spec.js
done;
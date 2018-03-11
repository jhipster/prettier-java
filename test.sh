#!/bin/bash
files=$(find $1 -regex ".*\.java")
files_cnt=$(find $1 -regex ".*\.java" | wc -l)
echo $files_cnt

test_folder="test_files"
rm -rf $test_folder
mkdir $test_folder

i=1
for file in $files; do
  array=(${file//\// })
  length=${#array[@]}
  java_file=${array[length-1]}
  cp_path=$test_folder/$java_file
  cp $file $cp_path
  output_path_prettier=$cp_path.prettier
  output_path_error=$cp_path.error
  echo $i " / " $files_cnt " " $output_path_prettier
  yarn prettier $file > $output_path_prettier 2> $output_path_error
  i=$((i+1))
done;

# delete all error files with 0 bytes
find test_files -name '*.error' -size 0 -print0 | xargs -0 rm

errors_cnt=$(find test_files -name '*.error' | sed 's/error/\*/g' | wc -l)
files_cnt=$(find test_files -name '*.prettier' | wc -l)

echo $errors_cnt / $files_cnt
echo "Creating PREVIEW.md"
TEST_FOLDERS=$(ls tests)

rm PREVIEW.md 2> /dev/null

for folder in $TEST_FOLDERS;
do
  echo "# $folder" >> PREVIEW.md
  snapshot=`cat tests/$folder/__snapshots__/jsfmt.spec.js.snap | sed '/~/,$!d' | sed 's/~//g' | sed 's/\`;//g'`
  echo "\`\`\`java" >> PREVIEW.md
  echo "$snapshot" >> PREVIEW.md
  echo "\`\`\`" >> PREVIEW.md
done;

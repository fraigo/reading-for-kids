if [ "$1" == "" ]; then
  echo "Usage: $0 lang 'expr1 expr2''"
  echo "Example: $0 en 'hello world'"
fi
WORDS="$2"
for WORD in $WORDS
do
  FILE=${WORD/á/a}
  FILE=${FILE/é/e}
  FILE=${FILE/í/i}
  FILE=${FILE/ó/o}
  FILE=${FILE/ú/u}
  FILE=${FILE/\?/}
  FILE=${FILE/,/}
  FILE=${FILE/./}
  FILE=$(echo $FILE | awk '{print tolower($0)}')
  if [ ! -e www/audio/$1/$FILE.wav ]; then
    echo "Creating $WORD..."
    ./scripts/newaudio.sh $1 $WORD
  else
    echo "Existe $WORD"
  fi
done
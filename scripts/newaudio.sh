if [ "$1" == "" ]; then
  echo "Usage: $0 lang expr folder"
  echo "Example: $0 lang hello /tmp"
fi
VOICE=Samantha
LANG=$1
if [ "$LANG" == "es" ]; then
  VOICE=Paulina
fi
WORD=$2
TARGET=$3
TARGETNAME=$4
if [ "$TARGET" == "" ]; then
  TARGET=www/audio/$LANG/
fi
FILE=$2
if [ ! "$TARGETNAME" == "" ]; then
  FILE=$TARGETNAME
fi
FILE=${FILE/á/a}
FILE=${FILE/é/e}
FILE=${FILE/í/i}
FILE=${FILE/ó/o}
FILE=${FILE/ú/u}
FILE=${FILE/\?/}
FILE=$(echo $FILE | awk '{print tolower($0)}')
WORD=${WORD/\?/}
say -v $VOICE "$WORD" 
say -v $VOICE "$WORD" -o "$FILE"
echo ffmpeg -i "$FILE.aiff" "$FILE.wav"
ffmpeg -i "$FILE.aiff" "$FILE.wav"
rm -f "$FILE.aiff"
echo "Move to $TARGET"
mv "$FILE.wav" $TARGET

#!/bin/bash

# Check parameters

if [ -z "$1" ]
then
	# Exit with error and usage notice

 	echo "Usage: mode {init|start}"
 	exit 2
fi

# Get node_modules/mode path

NPM_PATH="$(npm root -g)/mode"

# init command

if [ $1 == "init" ]
then
	echo "Creating project..."

	# Check if folder is empty

	if [ "$(ls -A .)" ]
	then
		# Throw warning and wait for confirmation

		read -p "Warning! Folder not empty. Continue (y/n)? " -n 1 -r REPLY

		# Move cursor to next line
		
		echo

		if [[ ! $REPLY =~ ^[Yy]$ ]]
		then
			# Exit with abort notice.

			echo "Aborted."
			exit 0
		fi
	fi
	echo "Creating folder structure..."

	# Copy project schelet from package to local folder

	cp -R "$NPM_PATH/app" .
	cp -R "$NPM_PATH/conf" .
	cp -R "$NPM_PATH/lib" .

	cp "$NPM_PATH/index.js" .
	cp "$NPM_PATH/start.js" .

	# Exit successfully

	echo "Done."
	exit 0
fi

# start command

if [ $1 == "start" ]
then
	# Run start.js through node

	node start.js

	# Exit successfully
	
	exit 0
fi

# Exit with error

echo "Unknown command $1"
exit 3
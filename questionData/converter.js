const fs = require("fs");

let fileContent = fs.readFileSync("./input.txt", "utf-8");

let questions = [];

let currentQuestion = undefined;
for(let line of fileContent.split("\n")){
	line = line.trim();
	if(line.length === 0) continue;
	if(line.match(/\d+\./)){
		if(currentQuestion) {
			questions.push(currentQuestion);
		}
		currentQuestion = {question: line.match(/(?<=\d\.).+/)[0].trim(), answers:[]};
		continue;
	}
	let pointsString = line.match(/\(\d+\)/)[0];
	if(!pointsString) continue;
	let points = Number(pointsString.substring(1, pointsString.length-1));
	if(currentQuestion.answers.length >= 6) continue;
	currentQuestion.answers.push({answer: line.substring(0, line.indexOf("(")), points});
}

fs.writeFileSync("./output.json", JSON.stringify(questions));
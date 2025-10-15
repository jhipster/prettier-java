class ConditionalExpression {

	int ternaryOperationThatShouldBreak() {
		int shortInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
		return thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
	}

	int ternaryOperationThatShouldBreak2() {
		int shortInteger = thisIsAVeryLongInteger ? thisIsAnotherVeryLongOne : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
		return thisIsAVeryLongInteger ? thisIsAnotherVeryLongOne : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
	}

	int ternaryOperationThatShouldNotBreak() {
		int a = b ? b : c;
		return b ? b : c;
	}

	void nestedTernary() {
		aaaaaaaaaa ? bbbbbbbbbb : cccccccccc ? dddddddddd : eeeeeeeeee ? ffffffffff : gggggggggg;
	}

	void ternaryWithComments() {
		a
			? // b
			b
			: // c
			c;
		a
			// b
			? b
			// c
			: c;
		a ? // b
			b
			: // c
			c;
		a
			? b // b
			: c; // c
	}

	void ternaryInParentheses() {
		(aaaaaaaaaa ? bbbbbbbbbb : cccccccccc.dddddddddd().eeeeeeeeee().ffffffffff());
	}
}

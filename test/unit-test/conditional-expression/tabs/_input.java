class ConditionalExpression {

	int ternaryOperationThatShouldBreak() {
		int shortInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
		return thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
	}

	int ternaryOperationThatShouldBreak2() {
		int shortInteger = thisIsAVeryLongInteger ? thisIsAnotherVeryLongOne : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
		return thisIsAVeryLongInteger ? thisIsAnotherVeryLongOne : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
	}

	void ternaryOperationThatShouldBreak3() {
		aaaaaaaaaa && bbbbbbbbbb && cccccccccc && dddddddddd && eeeeeeeeee && ffffffffff ? gggggggggg : hhhhhhhhhh;
		var v = aaaaaaaaaa && bbbbbbbbbb && cccccccccc && dddddddddd && eeeeeeeeee && ffffffffff ? gggggggggg : hhhhhhhhhh;
		v = aaaaaaaaaa && bbbbbbbbbb && cccccccccc && dddddddddd && eeeeeeeeee && ffffffffff ? gggggggggg : hhhhhhhhhh;
		f(aaaaaaaaaa && bbbbbbbbbb && cccccccccc && dddddddddd && eeeeeeeeee && ffffffffff ? gggggggggg : hhhhhhhhhh);
		return aaaaaaaaaa && bbbbbbbbbb && cccccccccc && dddddddddd && eeeeeeeeee && ffffffffff ? gggggggggg : hhhhhhhhhh;
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

	void assignment() {
		Aaaaaaaaaa aaaaaaaaaa = bbbbbbbbbb(cccccccccc, dddddddddd, eeeeeeeeee) != ffffffffff ? gggggggggg : hhhhhhhhhh;

		Aaaaaaaaaa aaaaaaaaaa = bbbbbbbbbb(cccccccccccccccccccc, dddddddddd, eeeeeeeeee) != ffffffffff ? gggggggggg : hhhhhhhhhh;

		Aaaaaaaaaa aaaaaaaaaa = bbbbbbbbbb(cccccccccccccccccccc, dddddddddddddddddddd, eeeeeeeeee) != ffffffffff ? gggggggggg : hhhhhhhhhh;

		aaaaaaaaaa = bbbbbbbbbb(cccccccccc, dddddddddd, eeeeeeeeee) != ffffffffff ? gggggggggg : hhhhhhhhhh;

		aaaaaaaaaa = bbbbbbbbbb(cccccccccccccccccccc, dddddddddd, eeeeeeeeee) != ffffffffff ? gggggggggg : hhhhhhhhhh;

		aaaaaaaaaa = bbbbbbbbbb(cccccccccccccccccccc, dddddddddddddddddddd, eeeeeeeeee) != ffffffffff ? gggggggggg : hhhhhhhhhh;
	}
}

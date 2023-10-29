class T {
    static String formatter(Object o) {
        String formatted = "unknown";
        if (o instanceof Integer i || p instanceof Point || q instanceof Circle c || r instanceof Square) {
            formatted = String.format("int %d", i);
        } else if (o instanceof Long l) {
            formatted = String.format("long %d", l);
        } else if (o instanceof Double d) {
            formatted = String.format("double %f", d);
        } else if (o instanceof String s) {
            formatted = String.format("String %s", s);
        }
        return formatted;
    }

    public boolean test(final Object obj) {
        return obj instanceof final Integer x && (x == 5 || x == 6 || x == 7 || x == 8 || x == 9 || x == 10 || x == 11);
    }

    void test(Buyer other) {
        return switch (other) {
            case null -> true;
            case Buyer b when this.bestPrice > b.bestPrice -> true;
            case Buyer b when this.bestPrice > b.bestPrice -> {
                return true;
            }
            case Buyer titi when this.bestPriceaaaaaaaazzzzzaaaaaaaaaq > b.bestPrice -> true;
            case Buyer titi when this.bestPriceaaaaaazzzaaaaaaaaaq > b.bestPrice -> true;
            case Buyer b when this.bestPrice > b.bestPrice && this.bestPrice > b.bestPrice && this.bestPrice > b.bestPrice && this.bestPrice > b.bestPrice -> true;
            case Buyer b when this.bestPrice > b.bestPrice && this.bestPrice > b.bestPrice && this.bestPrice > b.bestPrice && this.bestPrice > b.bestPrice -> {
                return true;
            }
            case Buyer b when (
                this.bestPrice > b.bestPrice &&
                this.bestPrice > b.bestPrice &&
                this.bestPrice > b.bestPrice &&
                this.bestPrice > b.bestPrice
            ) -> {
                return true;
            }
            default -> false;
        };
    }

    int recordPatterns(MyRecord r) {
        return switch (r) {
            case null, default -> 0;
            case MyRecord(A a) -> 0;
            case MyRecord(A a, B b) -> 0;
            case MyRecord(MyRecord(A a), B b) -> 0;
            case MyRecord(MyLongRecordTypeName(LongTypeName longVariableName, LongTypeName longVariableName), MyLongRecordTypeName(LongTypeName longVariableName, LongTypeName longVariableName)) -> 0;
            case MyRecord(LongTypeName longVariableName, LongTypeName longVariableName) -> 0;
            case MyRecord(LongTypeName longVariableName, LongTypeName longVariableName) when this.longVariableName > longVariableName && this.longVariableName > longVariableName -> 0;
            case MyRecord(LongTypeName longVariableName, LongTypeName longVariableName) when this.longVariableName > longVariableName && this.longVariableName > longVariableName -> longMethodName(longVariableName, longVariableName, longVariableName, longVariableName);
        };
    }
}

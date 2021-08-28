 class Test {
    enum Day {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY,
	SATURDAY, SUNDAY
    }

    public int calculate(Day d) {
        switch (d) {
	    case SATURDAY, SUNDAY -> d.ordinal();
            default -> {
                int len = d.toString().length();
                yield len*len;
            }
        };

        return;
    }

    public int calculate(Day d) {
        return switch (d) {
	    case SATURDAY, SUNDAY -> d.ordinal();
            default -> {
                int len = d.toString().length();
                yield len*len;
            }
        };
    }

    void should_not_throw_on_yield_static_imports() {
        Thread.yield ();
        yield();
        yield(a);
    }
}

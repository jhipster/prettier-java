public interface Interfaces {

	boolean isAvailable(Object propertyId);

	public static final Method METHOD = SomeStatic.findMethod();

}

public interface Interfaces extends Interface1, Interface2, Interface3, Interface4 {

    boolean isAvailable(Object propertyId);

    public static final Method METHOD = SomeStatic.findMethod();

}

public interface Interfaces extends Interface1, Interface2, Interface3, Interface4, Interface5, Interface6, Interface7, Interface8 {

    boolean isAvailable(Object propertyId);

    public static final Method METHOD = SomeStatic.findMethod();

}

private interface UserRepository extends ReactiveMongoRepository<User, String> {
  String USERS_BY_LOGIN_CACHE = "usersByLogin";
  String USERS_BY_EMAIL_CACHE = "usersByEmail";
  class T {}
  Mono<User> findOneByActivationKey(String activationKey);
  Flux<User> findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant dateTime);
  interface T {}
  Mono<User> findOneByResetKey(String resetKey);
  @Cacheable(cacheNames = USERS_BY_EMAIL_CACHE)
  Mono<User> findOneByEmailIgnoreCase(String email);
  @Cacheable(cacheNames = USERS_BY_LOGIN_CACHE)
  Mono<User> findOneByLogin(String login);
  Flux<User> findAllByLoginNot(Pageable pageable, String login);
  Mono<Long> countAllByLoginNot(String anonymousUser);
}

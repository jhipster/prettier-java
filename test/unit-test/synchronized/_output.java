class Synchronized {

  void doSomething() {
    synchronized (this.var) {
      doSynchronized();
    }
  }
}

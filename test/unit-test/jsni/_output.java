class JSNI {

  private native JsArray<MyItem> getItems() /*-{
    return this.items
  }-*/;

  private static native void registerHandler(
    MyHandler handler
  ) /*-{
    $doc.addEventListener("visibilitychange", function () {
      handler.@com.example.MyHandler::onEvent()();
    });
  }-*/;
}

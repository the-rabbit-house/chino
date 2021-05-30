package com.therabbithouse.chino;

import android.os.Bundle;
import android.view.View;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.plugin.http.Http;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    hideSystemUI();

    this.registerPlugin(Http.class);
  }

   private void hideSystemUI() {
    final int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
    View decorView = getWindow().getDecorView();

    decorView.setSystemUiVisibility(flags);
    decorView.setOnSystemUiVisibilityChangeListener((int visibility) ->  {
      if((visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
        decorView.setSystemUiVisibility(flags);
      }
    });
  }
}

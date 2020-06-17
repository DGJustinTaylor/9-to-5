function mySettings(props) {
  return (
    <Page>
<Section
  title={<Text bold align="center">Set your max speed</Text>}>
</Section>
<Text>Max Speed: {props.settingsStorage.getItem('Speed')} (Max speed defaults to 70)</Text>
<Slider
 settingsKey="SpeedValue"
 min="45"
 max="100"
 
 step="5"
 onChange={value => props.settingsStorage.setItem('Speed', value)}
/>
    </Page>
  );
}

registerSettingsPage(mySettings);

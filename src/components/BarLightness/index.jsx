import PropTypes from "prop-types";
import React from "react";
import LightnessPickerWrapper from "./component/LightnessPickerWrapper";

const propTypes = {
  height: PropTypes.number.isRequired,
  hue: PropTypes.number.isRequired,
  saturation: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  onValueChanged: PropTypes.func.isRequired,
  onValueChangeEnd: PropTypes.func,
  onValueChangeStart: PropTypes.func
};

const defaultProps = {};

export default class BarLightness extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onValueChanged = this.onValueChanged.bind(this);
  }

  onValueChanged(pos) {
    const { onValueChanged } = this.props;
    onValueChanged(100 - pos * 100);
  }

  render() {
    const {
      height,
      hue,
      saturation,
      value,
      width,
      onValueChangeEnd,
      onValueChangeStart
    } = this.props;
    return (
      <LightnessPickerWrapper
        height={height}
        hue={hue}
        position={1 - value / 100}
        saturationPercent={saturation * 100}
        width={width}
        onValueChanged={this.onValueChanged}
        onValueChangeEnd={onValueChangeEnd}
        onValueChangeStart={onValueChangeStart}
      />
    );
  }
}

BarLightness.propTypes = propTypes;
BarLightness.defaultProps = defaultProps;

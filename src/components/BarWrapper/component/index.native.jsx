import PropTypes from "prop-types";
import React from "react";
import { PanResponder } from "react-native";
import BarWrapperStyled from "../components-styled/BarWrapperStyled.native";
import { HOLD_TIME, TOLERANCE } from "../utils/config";
import Handler from "../../Handler";
import getPosition from "../../../utils/position";
import validatePosition from "../../../utils/position-validation";

const propTypes = {
  children: PropTypes.any.isRequired,
  height: PropTypes.number.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  position: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  onValueChanged: PropTypes.func.isRequired,
  onValueChangeEnd: PropTypes.func,
  onValueChangeStart: PropTypes.func
};

const defaultProps = {};

export default class BarWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.cache = {
      holdTimer: null,
      holdHandler: null,
      holdPositionX: null,
      holdPositionY: null
    };
    this.state = {
      dragging: false,
      holding: false,
      isDomInitialized: false
    };
    this.onDraggingChanged = this.onDraggingChanged.bind(this);
    this.onSetBarDom = this.onSetBarDom.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchRelease = this.onTouchRelease.bind(this);
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this.onTouchStart,
      onPanResponderMove: this.onTouchMove,
      onPanResponderRelease: this.onTouchRelease,
      onPanResponderTerminationRequest: () => false
    });
  }

  onTouchStart(e, gestureState) {
    const { isDisabled, width } = this.props;
    if (isDisabled) {
      return;
    }
    const targetBoundingClientRect = {
      left: 0,
      width
    };
    this.cache.holdPositionX = gestureState.x0;
    this.cache.holdPositionY = gestureState.y0;
    this.setState(() => ({
      holding: true
    }));
    this.setOnHoldTimerInitIfNeed(
      this.getOnHoldHandler(gestureState.x0, targetBoundingClientRect)
    );
  }

  onTouchMove(e, gestureState) {
    const {
      isDisabled,
      width,
      onValueChanged,
      position,
      height,
      onValueChangeStart
    } = this.props;
    if (isDisabled) {
      return;
    }
    const { dragging, holding } = this.state;
    if (this.checkHolding(gestureState.moveX, gestureState.moveY)) {
      return;
    }
    // disable move if moved over handler
    if (
      !dragging &&
      (!holding || Math.abs(position * width - gestureState.moveX) > height / 2)
    ) {
      return;
    }
    if (!dragging) {
      if (onValueChangeStart) {
        onValueChangeStart();
      }
      this.onDraggingChanged(true);
    }
    const newPosition = getPosition(0, gestureState.moveX, width);
    validatePosition(newPosition, onValueChanged);
  }

  onTouchRelease() {
    const { isDisabled, onValueChangeEnd } = this.props;
    if (isDisabled) {
      return;
    }
    if (onValueChangeEnd) {
      onValueChangeEnd();
    }
    this.onDraggingChanged(false);
    this.setCancelTimer();
  }

  onDraggingChanged(dragging) {
    this.setState(() => ({
      dragging
    }));
  }

  onSetBarDom(barDom) {
    this.barDom = barDom;
    this.setState(() => ({
      isDomInitialized: true
    }));
  }

  getOnHoldHandler(clientX, targetBoundingClientRect) {
    return () => {
      const { isDisabled, onValueChanged, onValueChangeStart } = this.props;
      if (isDisabled) {
        return;
      }
      if (this.state.holding) {
        onValueChanged(
          getPosition(
            targetBoundingClientRect.left,
            clientX,
            targetBoundingClientRect.width
          )
        );
        if (onValueChangeStart) {
          onValueChangeStart();
        }
        this.onDraggingChanged(true);
      }
    };
  }

  setOnHoldTimerInitIfNeed(holdHandler) {
    const holdTimer = this.cache.holdTimer;
    if (holdTimer === null || holdTimer === undefined) {
      this.cache.holdHandler = holdHandler;
      this.cache.holdTimer = setTimeout(this.cache.holdHandler, HOLD_TIME);
    }
  }

  setCancelTimer() {
    clearTimeout(this.cache.holdTimer);
    this.cache.holdTimer = null;
    this.cache.holdPositionX = null;
    this.setState(() => ({
      holding: false
    }));
  }

  checkHolding(x, y) {
    if (this.state.holding) {
      const diffX = Math.abs(this.cache.holdPositionX - x);
      const diffY = Math.abs(this.cache.holdPositionY - y);
      if (
        (diffX !== 0 && diffX > TOLERANCE) ||
        (diffY !== 0 && diffY > TOLERANCE)
      ) {
        this.setState(() => ({
          holding: false
        }));
        return false;
      }
    }
    return this.state.holding;
  }

  renderHandler(height, position) {
    const { width } = this.props;
    const { isDomInitialized } = this.state;
    if (!isDomInitialized) {
      return null;
    }
    return <Handler position={position} size={height} width={width} />;
  }

  render() {
    const {
      children,
      height,
      isDisabled,
      position,
      width,
      onValueChanged,
      ...props
    } = this.props;
    return (
      <BarWrapperStyled
        isDisabled={isDisabled}
        ref={this.onSetBarDom}
        styleHeight={height}
        styleWidth={width}
        {...props}
        {...this.panResponder.panHandlers}
      >
        {children}
        {this.renderHandler(height, position)}
      </BarWrapperStyled>
    );
  }
}

BarWrapper.propTypes = propTypes;
BarWrapper.defaultProps = defaultProps;

/* global window */
import PropTypes from "prop-types";
import React from "react";
import { HOLD_TIME, TOLERANCE } from "../utils/config";
import Handler from "../../Handler";
import BarWrapperStyled from "../components-styled/BarWrapperStyled";
import getPosition from "../../../utils/position";

const propTypes = {
  height: PropTypes.number.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  position: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  onValueChanged: PropTypes.func.isRequired
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
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onSetBarDom = this.onSetBarDom.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  componentDidMount() {
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("touchend", this.onTouchEnd);
    window.addEventListener("touchcancel", this.onTouchCancel);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("touchmove", this.onTouchMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("touchend", this.onTouchEnd);
    window.removeEventListener("touchcancel", this.onTouchCancel);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("touchmove", this.onTouchMove);
  }

  onMouseDown(e) {
    const targetBoundingClientRect = e.target.getBoundingClientRect();
    this.cache.holdPositionX = e.clientX;
    this.cache.holdPositionY = e.clientY;
    this.setState(() => ({
      holding: true
    }));
    this.setOnHoldTimerInitIfNeed(
      e,
      this.getOnHoldHandler(e.clientX, targetBoundingClientRect)
    );
  }

  onTouchStart(e) {
    const targetBoundingClientRect = e.target.getBoundingClientRect();
    const { clientX, clientY } = e.touches[0];
    this.cache.holdPositionX = clientX;
    this.cache.holdPositionY = clientY;
    this.setState(() => ({
      holding: true
    }));
    this.setOnHoldTimerInitIfNeed(
      e,
      this.getOnHoldHandler(clientX, targetBoundingClientRect)
    );
  }

  onMouseMove(e) {
    this.checkHolding(e, false);
  }

  onTouchMove(e) {
    this.checkHolding(e, true);
  }

  onMouseUp() {
    this.setCancelTimer();
  }

  onTouchEnd() {
    this.setCancelTimer();
  }

  onTouchCancel() {
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
      const { isDisabled, onValueChanged } = this.props;
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
        this.onDraggingChanged(true);
      }
    };
  }

  setOnHoldTimerInitIfNeed(e, holdHandler) {
    const holdTimer = this.cache.holdTimer;
    // allow only left button
    if (
      (holdTimer === null || holdTimer === undefined) &&
      (e.button === 0 || e.button === undefined)
    ) {
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

  checkHolding(e, isTouch) {
    if (this.state.holding) {
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;
      const diffX = Math.abs(this.cache.holdPositionX - clientX);
      const diffY = Math.abs(this.cache.holdPositionY - clientY);
      if (
        (diffX !== 0 && diffX > TOLERANCE) ||
        (diffY !== 0 && diffY > TOLERANCE)
      ) {
        this.setState(() => ({
          holding: false
        }));
      }
    }
  }

  renderHandler(height, position, onValueChange) {
    const { isDisabled, width } = this.props;
    const { dragging, isDomInitialized } = this.state;
    if (!isDomInitialized) {
      return null;
    }
    const barDomBoundingClientRect = this.barDom.getBoundingClientRect();
    return (
      <Handler
        barDom={this.barDom}
        isDisabled={isDisabled}
        isDragging={dragging}
        position={position}
        positionLeft={barDomBoundingClientRect.left}
        positionRight={barDomBoundingClientRect.right}
        size={height}
        width={width}
        onDraggingChanged={this.onDraggingChanged}
        onPositionChanged={onValueChange}
      />
    );
  }

  render() {
    const {
      height,
      isDisabled,
      position,
      width,
      onValueChanged,
      ...props
    } = this.props;
    return (
      <BarWrapperStyled
        innerRef={this.onSetBarDom}
        isDisabled={isDisabled}
        styleHeight={height}
        styleWidth={width}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
        {...props}
      >
        {this.renderHandler(height, position, onValueChanged)}
      </BarWrapperStyled>
    );
  }
}

BarWrapper.propTypes = propTypes;
BarWrapper.defaultProps = defaultProps;

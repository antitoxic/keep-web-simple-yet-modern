class COMPONENT_NAME extends React.Component {
  render() {
    const {props} = this;
    return renderComponent({
      ...props,
      content: props.children
    });
  }
}

import { JSX } from 'solid-js';
import type { AvaloniaNode } from './renderer';

// ---------------------------------------------------------------------------
// Native Avalonia CLR type interfaces
// These describe the runtime properties accessible on node.NativeControl.
// ---------------------------------------------------------------------------
export interface NativeControl {
  FocusAdorner?: any;
  Tag?: any;
  ContextMenu?: any;
  ContextFlyout?: any;
  DataTemplates?: any;
  IsLoaded?: boolean;
  Focusable?: boolean;
  IsEnabled?: boolean;
  IsEffectivelyEnabled?: boolean;
  Cursor?: any;
  IsKeyboardFocusWithin?: boolean;
  IsFocused?: boolean;
  IsHitTestVisible?: boolean;
  IsPointerOver?: boolean;
  IsTabStop?: boolean;
  TabIndex?: number;
  KeyBindings?: any;
  GestureRecognizers?: any;
  IsHoldingEnabled?: boolean;
  IsHoldWithMouseEnabled?: boolean;
  Handler?: any;
  Routes?: any;
  HandledEventsToo?: boolean;
  DesiredSize?: any;
  Width?: number;
  Height?: number;
  MinWidth?: number;
  MaxWidth?: number;
  MinHeight?: number;
  MaxHeight?: number;
  Margin?: string | number;
  HorizontalAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  UseLayoutRounding?: boolean;
  IsMeasureValid?: boolean;
  IsArrangeValid?: boolean;
  Bounds?: any;
  ClipToBounds?: boolean;
  Clip?: string;
  IsVisible?: boolean;
  Opacity?: number;
  OpacityMask?: string;
  CacheMode?: any;
  Effect?: any;
  HasMirrorTransform?: boolean;
  RenderTransform?: any;
  RenderTransformOrigin?: any;
  FlowDirection?: 'LeftToRight' | 'RightToLeft';
  VisualParent?: any;
  ZIndex?: number;
  IsEffectivelyVisible?: boolean;
  DataContext?: any;
  Name?: string;
  Parent?: any;
  TemplatedParent?: any;
  Theme?: any;
  IsInitialized?: boolean;
  Classes?: any;
  Styles?: any;
  StyleKey?: any;
  ActualThemeVariant?: any;
  Transitions?: JSX.Element | JSX.Element[];
  Instance?: any;
  BaseValue?: any;
  Dispatcher?: any;
  Focus(method?: any, keyModifiers?: any): boolean;
  AddHandler(routedEvent: any, handler: any, routes?: any, handledEventsToo?: boolean): any;
  RemoveHandler(routedEvent: any, handler: any): any;
  RaiseEvent(e: any): any;
  UpdateLayout(): any;
  ApplyTemplate(): any;
  Measure(availableSize: any): any;
  Arrange(rect: any): any;
  InvalidateMeasure(): any;
  InvalidateArrange(): any;
  InvalidateVisual(): any;
  Render(context: any): any;
  BeginInit(): any;
  EndInit(): any;
  ApplyStyling(): boolean;
  TryGetResource(key: any, theme?: any, value?: any): boolean;
  CheckAccess(): boolean;
  VerifyAccess(): any;
  ClearValue(property: any): any;
  Equals(obj?: any): boolean;
  GetHashCode(): number;
  GetValue(property: any): any;
  IsAnimating(property: any): boolean;
  IsSet(property: any): boolean;
  SetValue(property: any, value?: any, priority?: any): any;
  SetCurrentValue(property: any, value?: any): any;
  Bind(property: any, binding: any): any;
  CoerceValue(property: any): any;
}

export interface NativeTemplatedControl extends NativeControl {
  Background?: string;
  BackgroundSizing?: 'InnerBorderEdge' | 'OuterBorderEdge' | 'CenterBorder';
  BorderBrush?: string;
  BorderThickness?: string | number;
  CornerRadius?: string | number;
  FontFamily?: any;
  FontFeatures?: JSX.Element | JSX.Element[];
  FontSize?: number;
  FontStyle?: 'Normal' | 'Italic' | 'Oblique';
  FontWeight?: 'Thin' | 'ExtraLight' | 'UltraLight' | 'Light' | 'SemiLight' | 'Normal' | 'Regular' | 'Medium' | 'DemiBold' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'UltraBold' | 'Black' | 'Heavy' | 'Solid' | 'ExtraBlack' | 'UltraBlack';
  FontStretch?: 'UltraCondensed' | 'ExtraCondensed' | 'Condensed' | 'SemiCondensed' | 'Normal' | 'SemiExpanded' | 'Expanded' | 'ExtraExpanded' | 'UltraExpanded';
  Foreground?: string;
  LetterSpacing?: number;
  Padding?: string | number;
  IsTemplateFocusTarget?: boolean;
  ApplyTemplate(): any;
}

export interface NativeContentControl extends NativeTemplatedControl {
  Content?: any;
  ContentTemplate?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  Presenter?: any;
}

export interface NativeButton extends NativeContentControl {
  ClickMode?: 'Release' | 'Press';
  Command?: any;
  HotKey?: any;
  CommandParameter?: any;
  IsDefault?: boolean;
  IsCancel?: boolean;
  IsPressed?: boolean;
  Flyout?: any;
}

export interface NativeToggleButton extends NativeButton {
  IsChecked?: boolean;
  IsThreeState?: boolean;
}

export interface NativeCheckBox extends NativeToggleButton {
}

export interface NativeColumnDefinition {
  MaxWidth?: number;
  MinWidth?: number;
  Width?: string | number;
  ActualWidth?: number;
  SharedSizeGroup?: string;
  Dispatcher?: any;
  CheckAccess(): boolean;
  VerifyAccess(): any;
  ClearValue(property: any): any;
  Equals(obj?: any): boolean;
  GetHashCode(): number;
  GetValue(property: any): any;
  IsAnimating(property: any): boolean;
  IsSet(property: any): boolean;
  SetValue(property: any, value?: any, priority?: any): any;
  SetCurrentValue(property: any, value?: any): any;
  Bind(property: any, binding: any): any;
  CoerceValue(property: any): any;
}

export interface NativeTextBlock extends NativeControl {
  Background?: string;
  Padding?: string | number;
  FontFamily?: any;
  FontSize?: number;
  FontStyle?: 'Normal' | 'Italic' | 'Oblique';
  FontWeight?: 'Thin' | 'ExtraLight' | 'UltraLight' | 'Light' | 'SemiLight' | 'Normal' | 'Regular' | 'Medium' | 'DemiBold' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'UltraBold' | 'Black' | 'Heavy' | 'Solid' | 'ExtraBlack' | 'UltraBlack';
  FontStretch?: 'UltraCondensed' | 'ExtraCondensed' | 'Condensed' | 'SemiCondensed' | 'Normal' | 'SemiExpanded' | 'Expanded' | 'ExtraExpanded' | 'UltraExpanded';
  Foreground?: string;
  BaselineOffset?: number;
  LineHeight?: number;
  LineSpacing?: number;
  LetterSpacing?: number;
  MaxLines?: number;
  Text?: string;
  TextAlignment?: 'Left' | 'Center' | 'Right' | 'Start' | 'End' | 'DetectFromContent' | 'Justify';
  TextWrapping?: 'NoWrap' | 'Wrap' | 'WrapWithOverflow';
  TextTrimming?: any;
  TextDecorations?: any;
  FontFeatures?: JSX.Element | JSX.Element[];
  Inlines?: JSX.Element | JSX.Element[];
  TextLayout?: any;
  TextRuns?: JSX.Element | JSX.Element[];
  Render(context: any): any;
  GetTextRun(textSourceIndex: number): any;
}

export interface NativeTextBox extends NativeTemplatedControl {
  IsInactiveSelectionHighlightEnabled?: boolean;
  ClearSelectionOnLostFocus?: boolean;
  AcceptsReturn?: boolean;
  AcceptsTab?: boolean;
  CaretIndex?: number;
  IsReadOnly?: boolean;
  PasswordChar?: any;
  SelectionBrush?: string;
  SelectionForegroundBrush?: string;
  CaretBrush?: string;
  CaretBlinkInterval?: any;
  SelectionStart?: number;
  SelectionEnd?: number;
  MaxLength?: number;
  MaxLines?: number;
  MinLines?: number;
  Text?: string;
  TextAlignment?: 'Left' | 'Center' | 'Right' | 'Start' | 'End' | 'DetectFromContent' | 'Justify';
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  TextWrapping?: 'NoWrap' | 'Wrap' | 'WrapWithOverflow';
  LineHeight?: number;
  PlaceholderText?: string;
  Watermark?: string;
  UseFloatingPlaceholder?: boolean;
  UseFloatingWatermark?: boolean;
  PlaceholderForeground?: string;
  WatermarkForeground?: string;
  NewLine?: string;
  InnerLeftContent?: any;
  InnerRightContent?: any;
  RevealPassword?: boolean;
  CanCut?: boolean;
  CanCopy?: boolean;
  CanPaste?: boolean;
  IsUndoEnabled?: boolean;
  UndoLimit?: number;
  CanUndo?: boolean;
  CanRedo?: boolean;
  CaretPosition?: number;
  Equals(other: any): boolean;
  GetHashCode(): number;
  ClearSelection(): any;
  GetLineCount(): number;
  Cut(): any;
  Copy(): any;
  Paste(): any;
  Clear(): any;
  ScrollToLine(lineIndex: number): any;
  SelectAll(): any;
  Undo(): any;
  Redo(): any;
  GetTextRun(textSourceIndex: number): any;
}

export interface NativeStackPanel extends NativeControl {
  Spacing?: number;
  Orientation?: 'Horizontal' | 'Vertical';
  AreHorizontalSnapPointsRegular?: boolean;
  AreVerticalSnapPointsRegular?: boolean;
  Background?: string;
  Children?: any;
  IsItemsHost?: boolean;
  GetIrregularSnapPoints(orientation: 'Horizontal' | 'Vertical', snapPointsAlignment: 'Near' | 'Center' | 'Far'): JSX.Element | JSX.Element[];
  GetRegularSnapPoints(orientation: 'Horizontal' | 'Vertical', snapPointsAlignment: 'Near' | 'Center' | 'Far', offset: number): number;
  Render(context: any): any;
}

export interface NativeBorder extends NativeControl {
  Background?: string;
  BackgroundSizing?: 'InnerBorderEdge' | 'OuterBorderEdge' | 'CenterBorder';
  BorderBrush?: string;
  BorderThickness?: string | number;
  CornerRadius?: string | number;
  BoxShadow?: any;
  ClipToBoundsRadius?: string | number;
  Child?: any;
  Padding?: string | number;
  Render(context: any): any;
}

export interface NativeColorPicker extends NativeColorView {
  Content?: any;
  ContentTemplate?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
}

export interface NativeColorSlider extends NativeSlider {
  Color?: string;
  ColorComponent?: 'Alpha' | 'Component1' | 'Component2' | 'Component3';
  ColorModel?: 'Hsva' | 'Rgba';
  HsvColor?: any;
  IsAlphaVisible?: boolean;
  IsPerceptive?: boolean;
  IsRoundingEnabled?: boolean;
}

export interface NativeColorSpectrum extends NativeTemplatedControl {
  Color?: string;
  Components?: 'HueValue' | 'ValueHue' | 'HueSaturation' | 'SaturationHue' | 'SaturationValue' | 'ValueSaturation';
  HsvColor?: any;
  MaxHue?: number;
  MaxSaturation?: number;
  MaxValue?: number;
  MinHue?: number;
  MinSaturation?: number;
  MinValue?: number;
  Shape?: 'Box' | 'Ring';
  ThirdComponent?: 'Alpha' | 'Component1' | 'Component2' | 'Component3';
  RaiseColorChanged(): any;
}

export interface NativeColorView extends NativeTemplatedControl {
  Color?: string;
  ColorModel?: 'Hsva' | 'Rgba';
  ColorSpectrumComponents?: 'HueValue' | 'ValueHue' | 'HueSaturation' | 'SaturationHue' | 'SaturationValue' | 'ValueSaturation';
  ColorSpectrumShape?: 'Box' | 'Ring';
  HexInputAlphaPosition?: 'Leading' | 'Trailing';
  HsvColor?: any;
  IsAccentColorsVisible?: boolean;
  IsAlphaEnabled?: boolean;
  IsAlphaVisible?: boolean;
  IsColorComponentsVisible?: boolean;
  IsColorModelVisible?: boolean;
  IsColorPaletteVisible?: boolean;
  IsColorPreviewVisible?: boolean;
  IsColorSpectrumVisible?: boolean;
  IsColorSpectrumSliderVisible?: boolean;
  IsComponentSliderVisible?: boolean;
  IsComponentTextInputVisible?: boolean;
  IsHexInputVisible?: boolean;
  MaxHue?: number;
  MaxSaturation?: number;
  MaxValue?: number;
  MinHue?: number;
  MinSaturation?: number;
  MinValue?: number;
  PaletteColors?: JSX.Element | JSX.Element[];
  PaletteColumnCount?: number;
  Palette?: any;
  SelectedIndex?: number;
}

export interface NativeCommandBar extends NativeTemplatedControl {
  PrimaryCommands?: JSX.Element | JSX.Element[];
  SecondaryCommands?: JSX.Element | JSX.Element[];
  Content?: any;
  DefaultLabelPosition?: 'Bottom' | 'Right' | 'Collapsed';
  IsDynamicOverflowEnabled?: boolean;
  OverflowButtonVisibility?: 'Auto' | 'Visible' | 'Collapsed';
  IsOpen?: boolean;
  IsSticky?: boolean;
  ItemWidthBottom?: number;
  ItemWidthRight?: number;
  ItemWidthCollapsed?: number;
  HasSecondaryCommands?: boolean;
  IsOverflowButtonVisible?: boolean;
  VisiblePrimaryCommands?: any;
  OverflowItems?: any;
}

export interface NativeSlider extends NativeTemplatedControl {
  Orientation?: 'Horizontal' | 'Vertical';
  IsDirectionReversed?: boolean;
  IsSnapToTickEnabled?: boolean;
  TickFrequency?: number;
  TickPlacement?: 'None' | 'TopLeft' | 'BottomRight' | 'Outside';
  Ticks?: JSX.Element | JSX.Element[];
  Minimum?: number;
  Maximum?: number;
  Value?: number;
  SmallChange?: number;
  LargeChange?: number;
}

export interface NativeProgressBar extends NativeTemplatedControl {
  ContainerAnimationStartPosition?: number;
  ContainerAnimationEndPosition?: number;
  Container2AnimationStartPosition?: number;
  Container2AnimationEndPosition?: number;
  Container2Width?: number;
  ContainerWidth?: number;
  IndeterminateStartingOffset?: number;
  IndeterminateEndingOffset?: number;
  IsIndeterminate?: boolean;
  ShowProgressText?: boolean;
  ProgressTextFormat?: string;
  Orientation?: 'Horizontal' | 'Vertical';
  Percentage?: number;
  TemplateSettings?: any;
  Minimum?: number;
  Maximum?: number;
  Value?: number;
  SmallChange?: number;
  LargeChange?: number;
}

export interface NativeComboBox extends NativeTemplatedControl {
  IsDropDownOpen?: boolean;
  IsEditable?: boolean;
  MaxDropDownHeight?: number;
  SelectionBoxItem?: any;
  PlaceholderText?: string;
  PlaceholderForeground?: string;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  Text?: string;
  SelectionBoxItemTemplate?: any;
  AutoScrollToSelectedItem?: boolean;
  SelectedIndex?: number;
  SelectedItem?: any;
  SelectedValue?: any;
  SelectedValueBinding?: any;
  IsSelected?: boolean;
  IsTextSearchEnabled?: boolean;
  WrapSelection?: boolean;
  UpdateCount?: number;
  Selection?: any;
  SelectedItems?: any;
  ItemContainerTheme?: any;
  ItemCount?: number;
  ItemsPanel?: any;
  ItemsSource?: any;
  ItemTemplate?: any;
  DisplayMemberBinding?: any;
  Presenter?: any;
  ItemContainerGenerator?: any;
  Items?: any;
  ItemsPanelRoot?: any;
  ItemsView?: any;
  UpdateSelectionFromEvent(container: any, eventArgs: any): boolean;
  Clear(): any;
  BeginInit(): any;
  EndInit(): any;
  ContainerFromIndex(index: number): any;
  ContainerFromItem(item: any): any;
  IndexFromContainer(container: any): number;
  ItemFromContainer(container: any): any;
  GetRealizedContainers(): JSX.Element | JSX.Element[];
  ScrollIntoView(index: number): any;
}

export interface NativeListBox extends NativeTemplatedControl {
  Scroll?: any;
  AutoScrollToSelectedItem?: boolean;
  SelectedIndex?: number;
  SelectedItem?: any;
  SelectedValue?: any;
  SelectedValueBinding?: any;
  IsSelected?: boolean;
  IsTextSearchEnabled?: boolean;
  WrapSelection?: boolean;
  UpdateCount?: number;
  Selection?: any;
  SelectedItems?: any;
  ItemContainerTheme?: any;
  ItemCount?: number;
  ItemsPanel?: any;
  ItemsSource?: any;
  ItemTemplate?: any;
  DisplayMemberBinding?: any;
  Presenter?: any;
  ItemContainerGenerator?: any;
  Items?: any;
  ItemsPanelRoot?: any;
  ItemsView?: any;
  SelectAll(): any;
  UnselectAll(): any;
  BeginInit(): any;
  EndInit(): any;
  UpdateSelectionFromEvent(container: any, eventArgs: any): boolean;
  ContainerFromIndex(index: number): any;
  ContainerFromItem(item: any): any;
  IndexFromContainer(container: any): number;
  ItemFromContainer(container: any): any;
  GetRealizedContainers(): JSX.Element | JSX.Element[];
  ScrollIntoView(index: number): any;
}

export interface NativeNumericUpDown extends NativeTemplatedControl {
  AllowSpin?: boolean;
  ButtonSpinnerLocation?: any;
  ShowButtonSpinner?: boolean;
  ClipValueToMinMax?: boolean;
  NumberFormat?: any;
  FormatString?: string;
  Increment?: any;
  IsReadOnly?: boolean;
  Maximum?: any;
  Minimum?: any;
  ParsingNumberStyle?: any;
  Text?: string;
  TextConverter?: any;
  Value?: any;
  PlaceholderText?: string;
  Watermark?: string;
  PlaceholderForeground?: any;
  WatermarkForeground?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  TextAlignment?: any;
  InnerLeftContent?: any;
  InnerRightContent?: any;
}

export interface NativePipsPager extends NativeTemplatedControl {
  MaxVisiblePips?: number;
  IsNextButtonVisible?: boolean;
  NumberOfPages?: number;
  Orientation?: 'Horizontal' | 'Vertical';
  IsPreviousButtonVisible?: boolean;
  SelectedPageIndex?: number;
  TemplateSettings?: any;
  PreviousButtonTheme?: any;
  NextButtonTheme?: any;
}

export interface NativeRowDefinition {
  MaxHeight?: number;
  MinHeight?: number;
  Height?: string | number;
  ActualHeight?: number;
  SharedSizeGroup?: string;
  Dispatcher?: any;
  CheckAccess(): boolean;
  VerifyAccess(): any;
  ClearValue(property: any): any;
  Equals(obj?: any): boolean;
  GetHashCode(): number;
  GetValue(property: any): any;
  IsAnimating(property: any): boolean;
  IsSet(property: any): boolean;
  SetValue(property: any, value?: any, priority?: any): any;
  SetCurrentValue(property: any, value?: any): any;
  Bind(property: any, binding: any): any;
  CoerceValue(property: any): any;
}

export interface NativeScrollViewer extends NativeContentControl {
  BringIntoViewOnFocusChange?: boolean;
  Extent?: any;
  Offset?: any;
  Viewport?: any;
  LargeChange?: any;
  SmallChange?: any;
  ScrollBarMaximum?: any;
  HorizontalScrollBarVisibility?: 'Disabled' | 'Auto' | 'Hidden' | 'Visible';
  HorizontalSnapPointsType?: 'None' | 'Mandatory' | 'MandatorySingle';
  VerticalSnapPointsType?: 'None' | 'Mandatory' | 'MandatorySingle';
  HorizontalSnapPointsAlignment?: 'Near' | 'Center' | 'Far';
  VerticalSnapPointsAlignment?: 'Near' | 'Center' | 'Far';
  VerticalScrollBarVisibility?: 'Disabled' | 'Auto' | 'Hidden' | 'Visible';
  IsExpanded?: boolean;
  AllowAutoHide?: boolean;
  IsScrollChainingEnabled?: boolean;
  IsScrollInertiaEnabled?: boolean;
  IsDeferredScrollingEnabled?: boolean;
  CurrentAnchor?: any;
  LineUp(): any;
  LineDown(): any;
  LineLeft(): any;
  LineRight(): any;
  PageUp(): any;
  PageDown(): any;
  PageLeft(): any;
  PageRight(): any;
  ScrollToHome(): any;
  ScrollToEnd(): any;
  RegisterAnchorCandidate(element: any): any;
  UnregisterAnchorCandidate(element: any): any;
}

export interface NativeSpinner extends NativeContentControl {
  ValidSpinDirection?: 'None' | 'Increase' | 'Decrease';
}

export interface NativeTabControl extends NativeTemplatedControl {
  TabStripPlacement?: 'Left' | 'Bottom' | 'Right' | 'Top';
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  ContentTemplate?: any;
  SelectedContent?: any;
  SelectedContentTemplate?: any;
  PageTransition?: any;
  IndicatorTemplate?: any;
  AutoScrollToSelectedItem?: boolean;
  SelectedIndex?: number;
  SelectedItem?: any;
  SelectedValue?: any;
  SelectedValueBinding?: any;
  IsSelected?: boolean;
  IsTextSearchEnabled?: boolean;
  WrapSelection?: boolean;
  UpdateCount?: number;
  Selection?: any;
  SelectedItems?: any;
  ItemContainerTheme?: any;
  ItemCount?: number;
  ItemsPanel?: any;
  ItemsSource?: any;
  ItemTemplate?: any;
  DisplayMemberBinding?: any;
  Presenter?: any;
  ItemContainerGenerator?: any;
  Items?: any;
  ItemsPanelRoot?: any;
  ItemsView?: any;
  UpdateSelectionFromEvent(container: any, eventArgs: any): boolean;
  BeginInit(): any;
  EndInit(): any;
  ContainerFromIndex(index: number): any;
  ContainerFromItem(item: any): any;
  IndexFromContainer(container: any): number;
  ItemFromContainer(container: any): any;
  GetRealizedContainers(): JSX.Element | JSX.Element[];
  ScrollIntoView(index: number): any;
}

export interface NativeWindow extends NativeWindowBase {
  SizeToContent?: 'Manual' | 'Width' | 'Height' | 'WidthAndHeight';
  ExtendClientAreaToDecorationsHint?: boolean;
  ExtendClientAreaTitleBarHeightHint?: number;
  IsExtendedIntoWindowDecorations?: boolean;
  WindowDecorationMargin?: string | number;
  OffScreenMargin?: string | number;
  WindowDecorations?: any;
  WindowDecorationsTheme?: any;
  ShowActivated?: boolean;
  ShowInTaskbar?: boolean;
  ClosingBehavior?: 'OwnerAndChildWindows' | 'OwnerWindowOnly';
  WindowState?: 'Normal' | 'Minimized' | 'Maximized' | 'FullScreen';
  Title?: string;
  Icon?: any;
  WindowStartupLocation?: 'Manual' | 'CenterScreen' | 'CenterOwner';
  CanResize?: boolean;
  CanMinimize?: boolean;
  CanMaximize?: boolean;
  OwnedWindows?: JSX.Element | JSX.Element[];
  IsDialog?: boolean;
  BeginMoveDrag(e: any): any;
  BeginResizeDrag(edge: any, e: any): any;
  Close(): any;
  Hide(): any;
  Show(): any;
  ShowDialog(owner: any): any;
}

export interface NativeWindowBase extends NativeContentControl {
  IsActive?: boolean;
  Owner?: any;
  Topmost?: boolean;
  DesktopScaling?: number;
  ClientSize?: any;
  FrameSize?: any;
  TransparencyLevelHint?: string | string[] | any;
  ActualTransparencyLevel?: string | any;
  TransparencyBackgroundFallback?: string;
  ActualThemeVariant?: any;
  RequestedThemeVariant?: any;
  SystemBarColor?: any;
  AutoSafeAreaPadding?: boolean;
  PlatformImpl?: any;
  RendererDiagnostics?: any;
  RenderScaling?: number;
  StorageProvider?: any;
  InsetsManager?: any;
  InputPane?: any;
  Launcher?: any;
  Screens?: any;
  Clipboard?: any;
  FocusManager?: any;
  Activate(): any;
  Hide(): any;
  Show(): any;
  Dispose(): any;
  TryGetPlatformHandle(): any;
  RequestPlatformInhibition(type: any, reason: string): any;
  RequestAnimationFrame(action: any): any;
}

// ---------------------------------------------------------------------------
// Ref helper type
// ---------------------------------------------------------------------------

/**
 * The type of a ref for an Avalonia component.
 *
 * Usage:
 * ```tsx
 * let ref: AvaloniaRef<NativeTextBox>;
 * <TextBox ref={ref!} />
 * // After mount: ref.NativeControl?.Text
 * ```
 */
export type AvaloniaRef<TNative = unknown> = AvaloniaNode<TNative>;

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      accessText: any;
      adornerLayer: any;
      arc: any;
      autoCompleteBox: any;
      border: any;
      button: any;
      buttonSpinner: any;
      calendar: any;
      calendarButton: any;
      calendarDatePicker: any;
      calendarDayButton: any;
      calendarItem: any;
      canvas: any;
      carousel: any;
      carouselPage: any;
      checkBox: any;
      columnDefinition: any;
      colorPicker: any;
      colorPreviewer: any;
      colorSlider: any;
      colorSpectrum: any;
      colorView: any;
      commandBar: any;
      commandBarButton: any;
      commandBarSeparator: any;
      commandBarToggleButton: any;
      comboBox: any;
      comboBoxItem: any;
      contentControl: any;
      contentPage: any;
      contentPresenter: any;
      contextMenu: any;
      control: any;
      dataValidationErrors: any;
      datePicker: any;
      datePickerPresenter: any;
      dateTimePickerPanel: any;
      decorator: any;
      dockPanel: any;
      dropDownButton: any;
      ellipse: any;
      embeddableControlRoot: any;
      expander: any;
      experimentalAcrylicBorder: any;
      flyout: any;
      flyoutPresenter: any;
      grid: any;
      gridSplitter: any;
      headeredContentControl: any;
      headeredItemsControl: any;
      headeredSelectingItemsControl: any;
      hyperlinkButton: any;
      image: any;
      itemsControl: any;
      itemsPresenter: any;
      label: any;
      layoutTransformControl: any;
      line: any;
      listBox: any;
      listBoxItem: any;
      maskedTextBox: any;
      menu: any;
      menuFlyout: any;
      menuFlyoutPresenter: any;
      menuItem: any;
      nativeControlHost: any;
      nativeMenu: any;
      nativeMenuBar: any;
      nativeMenuItem: any;
      navigationPage: any;
      notificationCard: any;
      numericUpDown: any;
      overlayLayer: any;
      overlayPopupHost: any;
      page: any;
      panel: any;
      path: any;
      pathIcon: any;
      pipsPager: any;
      polygon: any;
      polyline: any;
      popup: any;
      popupRoot: any;
      progressBar: any;
      radioButton: any;
      rangeBase: any;
      rectangle: any;
      rowDefinition: any;
      refreshContainer: any;
      refreshVisualizer: any;
      relativePanel: any;
      repeatButton: any;
      reversibleStackPanel: any;
      run: any;
      scrollBar: any;
      scrollContentPresenter: any;
      scrollViewer: any;
      sector: any;
      shape: any;
      selectableTextBlock: any;
      selectingItemsControl: any;
      separator: any;
      slider: any;
      span: any;
      spinner: any;
      splitButton: any;
      splitView: any;
      stackPanel: any;
      tabControl: any;
      tabItem: any;
      tabStrip: any;
      tabStripItem: any;
      tabbedPage: any;
      templatedControl: any;
      textBlock: any;
      textBox: any;
      textElement: any;
      textPresenter: any;
      textSelectionHandle: any;
      textSelectorLayer: any;
      themeVariantScope: any;
      thumb: any;
      tickBar: any;
      timePicker: any;
      timePickerPresenter: any;
      toggleButton: any;
      toggleSplitButton: any;
      toggleSwitch: any;
      toolTip: any;
      track: any;
      transitioningContentControl: any;
      treeView: any;
      treeViewItem: any;
      uniformGrid: any;
      userControl: any;
      viewbox: any;
      virtualizingCarouselPanel: any;
      virtualizingStackPanel: any;
      visualLayerManager: any;
      window: any;
      windowBase: any;
      windowNotificationManager: any;
      wrapPanel: any;
    }
  }
}

export interface AccessTextProps extends TextBlockProps {
  ShowAccessKey?: boolean;
  AccessKey?: string;
}

export interface AdornerLayerProps extends CanvasProps {
  AdornedElement?: any;
  IsClipEnabled?: boolean;
  Adorner?: any;
  DefaultFocusAdorner?: any;
  Layer?: any;
  Subscription?: any;
}

export interface ArcProps extends ShapeProps {
  StartAngle?: number;
  SweepAngle?: number;
}

export interface AutoCompleteBoxProps extends TemplatedControlProps {
  CaretIndex?: number;
  PlaceholderText?: string;
  Watermark?: string;
  PlaceholderForeground?: any;
  WatermarkForeground?: any;
  MinimumPrefixLength?: number;
  MinimumPopulateDelay?: any;
  MaxDropDownHeight?: number;
  IsTextCompletionEnabled?: boolean;
  ItemTemplate?: any;
  ClearSelectionOnLostFocus?: boolean;
  IsDropDownOpen?: boolean;
  SelectedItem?: any;
  Text?: string;
  SearchText?: string;
  FilterMode?: 'None' | 'StartsWith' | 'StartsWithCaseSensitive' | 'StartsWithOrdinal' | 'StartsWithOrdinalCaseSensitive' | 'Contains' | 'ContainsCaseSensitive' | 'ContainsOrdinal' | 'ContainsOrdinalCaseSensitive' | 'Equals' | 'EqualsCaseSensitive' | 'EqualsOrdinal' | 'EqualsOrdinalCaseSensitive' | 'Custom';
  ItemFilter?: any;
  TextFilter?: any;
  ItemSelector?: any;
  TextSelector?: any;
  ItemsSource?: any;
  MaxLength?: number;
  InnerLeftContent?: any;
  InnerRightContent?: any;
  ValueMemberBinding?: any;
  onSelectionChanged?: () => void;
  onTextChanged?: () => void;
}

export interface BorderProps extends DecoratorProps {
  ref?: AvaloniaRef<NativeBorder> | ((el: AvaloniaRef<NativeBorder>) => void);
  Background?: string;
  BackgroundSizing?: 'InnerBorderEdge' | 'OuterBorderEdge' | 'CenterBorder';
  BorderBrush?: string;
  BorderThickness?: string | number;
  CornerRadius?: string | number;
  BoxShadow?: any;
  ClipToBoundsRadius?: string | number;
}

export interface ButtonProps extends ContentControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  ClickMode?: 'Release' | 'Press';
  Command?: any;
  HotKey?: any;
  CommandParameter?: any;
  IsDefault?: boolean;
  IsCancel?: boolean;
  IsPressed?: boolean;
  Flyout?: any;
  onClick?: () => void;
}

export interface ButtonSpinnerProps extends SpinnerProps {
  AllowSpin?: boolean;
  ShowButtonSpinner?: boolean;
  ButtonSpinnerLocation?: any;
}

export interface CalendarProps extends TemplatedControlProps {
  FirstDayOfWeek?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  IsTodayHighlighted?: boolean;
  HeaderBackground?: string;
  DisplayMode?: 'Month' | 'Year' | 'Decade';
  SelectionMode?: 'SingleDate' | 'SingleRange' | 'MultipleRange' | 'None';
  AllowTapRangeSelection?: boolean;
  SelectedDate?: any;
  DisplayDate?: any;
  DisplayDateStart?: any;
  DisplayDateEnd?: any;
  SelectedDates?: any;
  BlackoutDates?: any;
}

export interface CalendarButtonProps extends ButtonProps {
}

export interface CalendarDatePickerProps extends TemplatedControlProps {
  DisplayDate?: any;
  DisplayDateStart?: any;
  DisplayDateEnd?: any;
  FirstDayOfWeek?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  IsDropDownOpen?: boolean;
  IsTodayHighlighted?: boolean;
  SelectedDate?: any;
  SelectedDateFormat?: any;
  CustomDateFormatString?: string;
  TextConverter?: any;
  Text?: string;
  PlaceholderText?: string;
  Watermark?: string;
  UseFloatingPlaceholder?: boolean;
  UseFloatingWatermark?: boolean;
  PlaceholderForeground?: any;
  WatermarkForeground?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  BlackoutDates?: any;
}

export interface CalendarDayButtonProps extends ButtonProps {
}

export interface CalendarItemProps extends TemplatedControlProps {
  HeaderBackground?: string;
  DayTitleTemplate?: any;
}

export interface CanvasProps extends PanelProps {
  Left?: number;
  Top?: number;
  Right?: number;
  Bottom?: number;
}

export interface CarouselProps extends SelectingItemsControlProps {
  PageTransition?: any;
  IsSwipeEnabled?: boolean;
  ViewportFraction?: number;
  IsSwiping?: boolean;
}

export interface CarouselPageProps extends PageProps {
  ItemsPanel?: any;
  PageTransition?: any;
  IsGestureEnabled?: boolean;
  IsKeyboardNavigationEnabled?: boolean;
  SelectedIndex?: number;
  SelectedPage?: any;
  Pages?: JSX.Element | JSX.Element[];
  ItemsSource?: any;
  PageTemplate?: any;
}

export interface CheckBoxProps extends ToggleButtonProps {
  ref?: AvaloniaRef<NativeCheckBox> | ((el: AvaloniaRef<NativeCheckBox>) => void);
}

export interface ColumnDefinitionProps {
  ref?: AvaloniaRef<NativeColumnDefinition> | ((el: AvaloniaRef<NativeColumnDefinition>) => void);
  MaxWidth?: number;
  MinWidth?: number;
  Width?: string | number;
  ActualWidth?: number;
  SharedSizeGroup?: string;
  Dispatcher?: any;
}

export interface ColorPickerProps extends ColorViewProps {
  ref?: AvaloniaRef<NativeColorPicker> | ((el: AvaloniaRef<NativeColorPicker>) => void);
  Content?: any;
  ContentTemplate?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
}

export interface ColorPreviewerProps extends TemplatedControlProps {
  HsvColor?: any;
  IsAccentColorsVisible?: boolean;
}

export interface ColorSliderProps extends SliderProps {
  ref?: AvaloniaRef<NativeColorSlider> | ((el: AvaloniaRef<NativeColorSlider>) => void);
  Color?: string;
  ColorComponent?: 'Alpha' | 'Component1' | 'Component2' | 'Component3';
  ColorModel?: 'Hsva' | 'Rgba';
  HsvColor?: any;
  IsAlphaVisible?: boolean;
  IsPerceptive?: boolean;
  IsRoundingEnabled?: boolean;
}

export interface ColorSpectrumProps extends TemplatedControlProps {
  ref?: AvaloniaRef<NativeColorSpectrum> | ((el: AvaloniaRef<NativeColorSpectrum>) => void);
  Color?: string;
  Components?: 'HueValue' | 'ValueHue' | 'HueSaturation' | 'SaturationHue' | 'SaturationValue' | 'ValueSaturation';
  HsvColor?: any;
  MaxHue?: number;
  MaxSaturation?: number;
  MaxValue?: number;
  MinHue?: number;
  MinSaturation?: number;
  MinValue?: number;
  Shape?: 'Box' | 'Ring';
  ThirdComponent?: 'Alpha' | 'Component1' | 'Component2' | 'Component3';
}

export interface ColorViewProps extends TemplatedControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  Color?: string;
  ColorModel?: 'Hsva' | 'Rgba';
  ColorSpectrumComponents?: 'HueValue' | 'ValueHue' | 'HueSaturation' | 'SaturationHue' | 'SaturationValue' | 'ValueSaturation';
  ColorSpectrumShape?: 'Box' | 'Ring';
  HexInputAlphaPosition?: 'Leading' | 'Trailing';
  HsvColor?: any;
  IsAccentColorsVisible?: boolean;
  IsAlphaEnabled?: boolean;
  IsAlphaVisible?: boolean;
  IsColorComponentsVisible?: boolean;
  IsColorModelVisible?: boolean;
  IsColorPaletteVisible?: boolean;
  IsColorPreviewVisible?: boolean;
  IsColorSpectrumVisible?: boolean;
  IsColorSpectrumSliderVisible?: boolean;
  IsComponentSliderVisible?: boolean;
  IsComponentTextInputVisible?: boolean;
  IsHexInputVisible?: boolean;
  MaxHue?: number;
  MaxSaturation?: number;
  MaxValue?: number;
  MinHue?: number;
  MinSaturation?: number;
  MinValue?: number;
  PaletteColors?: JSX.Element | JSX.Element[];
  PaletteColumnCount?: number;
  Palette?: any;
  SelectedIndex?: number;
}

export interface CommandBarProps extends TemplatedControlProps {
  ref?: AvaloniaRef<NativeCommandBar> | ((el: AvaloniaRef<NativeCommandBar>) => void);
  PrimaryCommands?: JSX.Element | JSX.Element[];
  SecondaryCommands?: JSX.Element | JSX.Element[];
  Content?: any;
  DefaultLabelPosition?: 'Bottom' | 'Right' | 'Collapsed';
  IsDynamicOverflowEnabled?: boolean;
  OverflowButtonVisibility?: 'Auto' | 'Visible' | 'Collapsed';
  IsOpen?: boolean;
  IsSticky?: boolean;
  ItemWidthBottom?: number;
  ItemWidthRight?: number;
  ItemWidthCollapsed?: number;
  HasSecondaryCommands?: boolean;
  IsOverflowButtonVisible?: boolean;
  VisiblePrimaryCommands?: any;
  OverflowItems?: any;
  onOpening?: () => void;
  onOpened?: () => void;
  onClosing?: () => void;
  onClosed?: () => void;
}

export interface CommandBarButtonProps extends ButtonProps {
  Label?: string;
  Icon?: any;
  IsCompact?: boolean;
  DynamicOverflowOrder?: number;
  LabelPosition?: 'Bottom' | 'Right' | 'Collapsed';
  IsInOverflow?: boolean;
}

export interface CommandBarSeparatorProps extends SeparatorProps {
  IsCompact?: boolean;
  IsInOverflow?: boolean;
}

export interface CommandBarToggleButtonProps extends ToggleButtonProps {
  Label?: string;
  Icon?: any;
  IsCompact?: boolean;
  DynamicOverflowOrder?: number;
  LabelPosition?: 'Bottom' | 'Right' | 'Collapsed';
  IsInOverflow?: boolean;
}

export interface ComboBoxProps extends SelectingItemsControlProps {
  ref?: AvaloniaRef<NativeComboBox> | ((el: AvaloniaRef<NativeComboBox>) => void);
  IsDropDownOpen?: boolean;
  IsEditable?: boolean;
  MaxDropDownHeight?: number;
  SelectionBoxItem?: any;
  PlaceholderText?: string;
  PlaceholderForeground?: string;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  Text?: string;
  SelectionBoxItemTemplate?: any;
}

export interface ComboBoxItemProps extends ListBoxItemProps {
}

export interface ContentControlProps extends TemplatedControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  Content?: any;
  ContentTemplate?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  Presenter?: any;
}

export interface ContentPageProps extends PageProps {
  Content?: any;
  ContentTemplate?: any;
  AutomaticallyApplySafeAreaPadding?: boolean;
  TopCommandBar?: any;
  BottomCommandBar?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
}

export interface ContentPresenterProps extends ControlProps {
  Background?: string;
  BackgroundSizing?: 'InnerBorderEdge' | 'OuterBorderEdge' | 'CenterBorder';
  BorderBrush?: string;
  BorderThickness?: string | number;
  CornerRadius?: string | number;
  BoxShadow?: any;
  Foreground?: string;
  FontFamily?: any;
  FontSize?: number;
  FontStyle?: 'Normal' | 'Italic' | 'Oblique';
  FontWeight?: 'Thin' | 'ExtraLight' | 'UltraLight' | 'Light' | 'SemiLight' | 'Normal' | 'Regular' | 'Medium' | 'DemiBold' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'UltraBold' | 'Black' | 'Heavy' | 'Solid' | 'ExtraBlack' | 'UltraBlack';
  FontStretch?: 'UltraCondensed' | 'ExtraCondensed' | 'Condensed' | 'SemiCondensed' | 'Normal' | 'SemiExpanded' | 'Expanded' | 'ExtraExpanded' | 'UltraExpanded';
  TextAlignment?: 'Left' | 'Center' | 'Right' | 'Start' | 'End' | 'DetectFromContent' | 'Justify';
  TextWrapping?: 'NoWrap' | 'Wrap' | 'WrapWithOverflow';
  TextTrimming?: any;
  LineHeight?: number;
  LetterSpacing?: number;
  MaxLines?: number;
  Child?: any;
  Content?: any;
  ContentTemplate?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  Padding?: string | number;
  RecognizesAccessKey?: boolean;
}

export interface ContextMenuProps extends SelectingItemsControlProps {
  HorizontalOffset?: number;
  VerticalOffset?: number;
  PlacementAnchor?: 'None' | 'Top' | 'Bottom' | 'VerticalMask' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight' | 'HorizontalMask' | 'AllMask';
  PlacementConstraintAdjustment?: 'None' | 'SlideX' | 'SlideY' | 'FlipX' | 'FlipY' | 'ResizeX' | 'ResizeY' | 'All';
  PlacementGravity?: 'None' | 'Top' | 'Bottom' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight';
  Placement?: 'Pointer' | 'Bottom' | 'Right' | 'Left' | 'Top' | 'Center' | 'AnchorAndGravity' | 'TopEdgeAlignedLeft' | 'TopEdgeAlignedRight' | 'BottomEdgeAlignedLeft' | 'BottomEdgeAlignedRight' | 'LeftEdgeAlignedTop' | 'LeftEdgeAlignedBottom' | 'RightEdgeAlignedTop' | 'RightEdgeAlignedBottom' | 'Custom';
  PlacementRect?: any;
  WindowManagerAddShadowHint?: boolean;
  PlacementTarget?: any;
  CustomPopupPlacementCallback?: any;
  IsOpen?: boolean;
}

export interface ControlProps {
  children?: JSX.Element | JSX.Element[];
  /** Ref to the virtual Avalonia node. Use AvaloniaRef<NativeXxx> for a typed native control. */
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  DataContext?: any;
  Name?: string;
  Parent?: any;
  TemplatedParent?: any;
  Theme?: any;
  IsInitialized?: boolean;
  Classes?: any;
  Styles?: any;
  StyleKey?: any;
  ActualThemeVariant?: any;
  Bounds?: any;
  ClipToBounds?: boolean;
  Clip?: string;
  IsVisible?: boolean;
  Opacity?: number;
  OpacityMask?: string;
  CacheMode?: any;
  Effect?: any;
  HasMirrorTransform?: boolean;
  RenderTransform?: any;
  RenderTransformOrigin?: any;
  FlowDirection?: 'LeftToRight' | 'RightToLeft';
  VisualParent?: any;
  ZIndex?: number;
  IsEffectivelyVisible?: boolean;
  DesiredSize?: any;
  Width?: number;
  Height?: number;
  MinWidth?: number;
  MaxWidth?: number;
  MinHeight?: number;
  MaxHeight?: number;
  Margin?: string | number;
  HorizontalAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  UseLayoutRounding?: boolean;
  IsMeasureValid?: boolean;
  IsArrangeValid?: boolean;
  Focusable?: boolean;
  IsEnabled?: boolean;
  IsEffectivelyEnabled?: boolean;
  Cursor?: any;
  IsKeyboardFocusWithin?: boolean;
  IsFocused?: boolean;
  IsHitTestVisible?: boolean;
  IsPointerOver?: boolean;
  IsTabStop?: boolean;
  TabIndex?: number;
  KeyBindings?: any;
  GestureRecognizers?: any;
  IsHoldingEnabled?: boolean;
  IsHoldWithMouseEnabled?: boolean;
  Handler?: any;
  Routes?: any;
  HandledEventsToo?: boolean;
  onEffectiveViewportChanged?: () => void;
  onLayoutUpdated?: () => void;
  onGotFocus?: () => void;
  onGettingFocus?: () => void;
  onLostFocus?: () => void;
  onLosingFocus?: () => void;
  onKeyDown?: () => void;
  onKeyUp?: () => void;
  onTextInput?: () => void;
  onTextInputMethodClientRequested?: () => void;
  onPointerEntered?: () => void;
  onPointerExited?: () => void;
  onPointerMoved?: () => void;
  onPointerPressed?: () => void;
  onPointerReleased?: () => void;
  onPointerCaptureLost?: () => void;
  onPointerWheelChanged?: () => void;
  onContextRequested?: () => void;
  onContextCanceled?: () => void;
  onPinch?: () => void;
  onPinchEnded?: () => void;
  onPullGesture?: () => void;
  onPullGestureEnded?: () => void;
  onSwipeGesture?: () => void;
  onSwipeGestureEnded?: () => void;
  onScrollGesture?: () => void;
  onScrollGestureInertiaStarting?: () => void;
  onScrollGestureEnded?: () => void;
  onPointerTouchPadGestureMagnify?: () => void;
  onPointerTouchPadGestureRotate?: () => void;
  onPointerTouchPadGestureSwipe?: () => void;
  onTapped?: () => void;
  onRightTapped?: () => void;
  onHolding?: () => void;
  onDoubleTapped?: () => void;
  FocusAdorner?: any;
  Tag?: any;
  ContextMenu?: any;
  ContextFlyout?: any;
  DataTemplates?: any;
  IsLoaded?: boolean;
  Transitions?: JSX.Element | JSX.Element[];
  Instance?: any;
  BaseValue?: any;
  Dispatcher?: any;
  onRequestBringIntoView?: () => void;
  onLoaded?: () => void;
  onUnloaded?: () => void;
  onSizeChanged?: () => void;
}

export interface DataValidationErrorsProps extends ContentControlProps {
  Errors?: JSX.Element | JSX.Element[];
  HasErrors?: boolean;
  ErrorConverter?: any;
  ErrorTemplate?: any;
  Owner?: any;
}

export interface DatePickerProps extends TemplatedControlProps {
  DayFormat?: string;
  DayVisible?: boolean;
  MaxYear?: any;
  MinYear?: any;
  MonthFormat?: string;
  MonthVisible?: boolean;
  YearFormat?: string;
  YearVisible?: boolean;
  SelectedDate?: any;
}

export interface DatePickerPresenterProps extends TemplatedControlProps {
  Date?: any;
  DayFormat?: string;
  DayVisible?: boolean;
  MaxYear?: any;
  MinYear?: any;
  MonthFormat?: string;
  MonthVisible?: boolean;
  YearFormat?: string;
  YearVisible?: boolean;
}

export interface DateTimePickerPanelProps extends PanelProps {
  ItemHeight?: number;
  PanelType?: any;
  ItemFormat?: string;
  ShouldLoop?: boolean;
  IsLogicalScrollEnabled?: boolean;
  ScrollSize?: any;
  PageScrollSize?: any;
  Extent?: any;
  Viewport?: any;
}

export interface DecoratorProps extends ControlProps {
  Child?: any;
  Padding?: string | number;
}

export interface DockPanelProps extends PanelProps {
  Dock?: 'Left' | 'Bottom' | 'Right' | 'Top';
  LastChildFill?: boolean;
  HorizontalSpacing?: number;
  VerticalSpacing?: number;
}

export interface DropDownButtonProps extends ButtonProps {
}

export interface EllipseProps extends ShapeProps {
}

export interface EmbeddableControlRootProps extends ContentControlProps {
  ClientSize?: any;
  FrameSize?: any;
  TransparencyLevelHint?: string | string[] | any;
  ActualTransparencyLevel?: string | any;
  TransparencyBackgroundFallback?: string;
  RequestedThemeVariant?: any;
  SystemBarColor?: any;
  AutoSafeAreaPadding?: boolean;
  PlatformImpl?: any;
  RendererDiagnostics?: any;
  RenderScaling?: number;
  StorageProvider?: any;
  InsetsManager?: any;
  InputPane?: any;
  Launcher?: any;
  Screens?: any;
  Clipboard?: any;
  FocusManager?: any;
}

export interface ExpanderProps extends HeaderedContentControlProps {
  ContentTransition?: any;
  ExpandDirection?: 'Down' | 'Up' | 'Left' | 'Right';
  IsExpanded?: boolean;
  onCollapsed?: () => void;
  onCollapsing?: () => void;
  onExpanded?: () => void;
  onExpanding?: () => void;
}

export interface ExperimentalAcrylicBorderProps extends DecoratorProps {
  CornerRadius?: string | number;
  Material?: any;
}

export interface FlyoutProps {
  Content?: any;
  ContentTemplate?: any;
  FlyoutPresenterTheme?: any;
  FlyoutPresenterClasses?: any;
  Placement?: 'Pointer' | 'Bottom' | 'Right' | 'Left' | 'Top' | 'Center' | 'AnchorAndGravity' | 'TopEdgeAlignedLeft' | 'TopEdgeAlignedRight' | 'BottomEdgeAlignedLeft' | 'BottomEdgeAlignedRight' | 'LeftEdgeAlignedTop' | 'LeftEdgeAlignedBottom' | 'RightEdgeAlignedTop' | 'RightEdgeAlignedBottom' | 'Custom';
  HorizontalOffset?: number;
  VerticalOffset?: number;
  PlacementAnchor?: 'None' | 'Top' | 'Bottom' | 'VerticalMask' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight' | 'HorizontalMask' | 'AllMask';
  PlacementGravity?: 'None' | 'Top' | 'Bottom' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight';
  CustomPopupPlacementCallback?: any;
  ShowMode?: any;
  OverlayDismissEventPassThrough?: boolean;
  OverlayInputPassThroughElement?: any;
  PlacementConstraintAdjustment?: 'None' | 'SlideX' | 'SlideY' | 'FlipX' | 'FlipY' | 'ResizeX' | 'ResizeY' | 'All';
  Popup?: any;
  IsOpen?: boolean;
  Target?: any;
  AttachedFlyout?: any;
  Dispatcher?: any;
}

export interface FlyoutPresenterProps extends ContentControlProps {
}

export interface GridProps extends PanelProps {
  ShowGridLines?: boolean;
  RowSpacing?: number;
  ColumnSpacing?: number;
  Column?: number;
  Row?: number;
  ColumnSpan?: number;
  RowSpan?: number;
  IsSharedSizeScope?: boolean;
}

export interface GridSplitterProps extends ThumbProps {
  ResizeDirection?: any;
  ResizeBehavior?: 'BasedOnAlignment' | 'CurrentAndNext' | 'PreviousAndCurrent' | 'PreviousAndNext';
  ShowsPreview?: boolean;
  KeyboardIncrement?: number;
  DragIncrement?: number;
  PreviewContent?: any;
}

export interface HeaderedContentControlProps extends ContentControlProps {
  Header?: any;
  HeaderTemplate?: any;
  HeaderPresenter?: any;
}

export interface HeaderedItemsControlProps extends ItemsControlProps {
  Header?: any;
  HeaderTemplate?: any;
  HeaderPresenter?: any;
}

export interface HeaderedSelectingItemsControlProps extends SelectingItemsControlProps {
  Header?: any;
  HeaderTemplate?: any;
  HeaderPresenter?: any;
}

export interface HyperlinkButtonProps extends ButtonProps {
  IsVisited?: boolean;
  NavigateUri?: any;
}

export interface ImageProps extends ControlProps {
  Source?: any;
  BlendMode?: any;
  Stretch?: 'None' | 'Fill' | 'Uniform' | 'UniformToFill';
  StretchDirection?: 'UpOnly' | 'DownOnly' | 'Both';
}

export interface ItemsControlProps extends TemplatedControlProps {
  ItemContainerTheme?: any;
  ItemCount?: number;
  ItemsPanel?: any;
  ItemsSource?: any;
  ItemTemplate?: any;
  DisplayMemberBinding?: any;
  Presenter?: any;
  ItemContainerGenerator?: any;
  Items?: any;
  ItemsPanelRoot?: any;
  ItemsView?: any;
}

export interface ItemsPresenterProps extends ControlProps {
  ItemsPanel?: any;
  Panel?: any;
}

export interface LabelProps extends ContentControlProps {
  Target?: any;
}

export interface LayoutTransformControlProps extends DecoratorProps {
  LayoutTransform?: any;
  UseRenderTransform?: boolean;
  TransformRoot?: any;
}

export interface LineProps extends ShapeProps {
  StartPoint?: any;
  EndPoint?: any;
}

export interface ListBoxProps extends SelectingItemsControlProps {
  ref?: AvaloniaRef<NativeListBox> | ((el: AvaloniaRef<NativeListBox>) => void);
  Scroll?: any;
}

export interface ListBoxItemProps extends ContentControlProps {
  IsSelected?: boolean;
}

export interface MaskedTextBoxProps extends TextBoxProps {
  AsciiOnly?: boolean;
  Culture?: any;
  HidePromptOnLeave?: boolean;
  MaskCompleted?: boolean;
  MaskFull?: boolean;
  Mask?: string;
  PromptChar?: any;
  ResetOnPrompt?: boolean;
  ResetOnSpace?: boolean;
  MaskProvider?: any;
}

export interface MenuProps extends SelectingItemsControlProps {
  IsOpen?: boolean;
}

export interface MenuFlyoutProps {
  ItemsSource?: any;
  ItemTemplate?: any;
  ItemContainerTheme?: any;
  FlyoutPresenterTheme?: any;
  Items?: any;
  FlyoutPresenterClasses?: any;
  Placement?: 'Pointer' | 'Bottom' | 'Right' | 'Left' | 'Top' | 'Center' | 'AnchorAndGravity' | 'TopEdgeAlignedLeft' | 'TopEdgeAlignedRight' | 'BottomEdgeAlignedLeft' | 'BottomEdgeAlignedRight' | 'LeftEdgeAlignedTop' | 'LeftEdgeAlignedBottom' | 'RightEdgeAlignedTop' | 'RightEdgeAlignedBottom' | 'Custom';
  HorizontalOffset?: number;
  VerticalOffset?: number;
  PlacementAnchor?: 'None' | 'Top' | 'Bottom' | 'VerticalMask' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight' | 'HorizontalMask' | 'AllMask';
  PlacementGravity?: 'None' | 'Top' | 'Bottom' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight';
  CustomPopupPlacementCallback?: any;
  ShowMode?: any;
  OverlayDismissEventPassThrough?: boolean;
  OverlayInputPassThroughElement?: any;
  PlacementConstraintAdjustment?: 'None' | 'SlideX' | 'SlideY' | 'FlipX' | 'FlipY' | 'ResizeX' | 'ResizeY' | 'All';
  Popup?: any;
  IsOpen?: boolean;
  Target?: any;
  AttachedFlyout?: any;
  Dispatcher?: any;
}

export interface MenuFlyoutPresenterProps extends SelectingItemsControlProps {
  IsOpen?: boolean;
}

export interface MenuItemProps extends HeaderedSelectingItemsControlProps {
  Command?: any;
  HotKey?: any;
  CommandParameter?: any;
  Icon?: any;
  InputGesture?: any;
  IsSubMenuOpen?: boolean;
  StaysOpenOnClick?: boolean;
  ToggleType?: 'None' | 'CheckBox' | 'Radio';
  IsChecked?: boolean;
  GroupName?: string;
  HasSubMenu?: boolean;
  IsTopLevel?: boolean;
  onClick?: () => void;
  onPointerEnteredItem?: () => void;
  onPointerExitedItem?: () => void;
  onSubmenuOpened?: () => void;
}

export interface NativeControlHostProps extends ControlProps {
}

export interface NativeMenuProps {
  Parent?: any;
  Items?: JSX.Element | JSX.Element[];
  IsNativeMenuExported?: boolean;
  Menu?: any;
  ChangingIsExported?: boolean;
  Exporter?: any;
  Dispatcher?: any;
}

export interface NativeMenuBarProps extends TemplatedControlProps {
}

export interface NativeMenuItemProps {
  Menu?: any;
  Icon?: any;
  Header?: string;
  ToolTip?: string;
  Gesture?: any;
  IsChecked?: boolean;
  ToggleType?: 'None' | 'CheckBox' | 'Radio';
  Command?: any;
  CommandParameter?: any;
  IsEnabled?: boolean;
  IsVisible?: boolean;
  HasClickHandlers?: boolean;
  Parent?: any;
  Dispatcher?: any;
}

export interface NavigationPageProps extends PageProps {
  Content?: any;
  PageTransition?: any;
  ModalTransition?: any;
  IsBackButtonEffectivelyVisible?: boolean;
  BarLayoutBehavior?: any;
  HasShadow?: boolean;
  BarHeight?: number;
  BarHeightOverride?: number;
  EffectiveBarHeight?: number;
  BackButtonContent?: any;
  HasBackButton?: boolean;
  IsBackButtonVisible?: boolean;
  TopCommandBar?: any;
  BottomCommandBar?: any;
  HasNavigationBar?: boolean;
  IsGestureEnabled?: boolean;
  IsNavigating?: boolean;
  CanGoBack?: boolean;
  IsBackButtonEnabled?: boolean;
  StackDepth?: number;
  Pages?: JSX.Element | JSX.Element[];
  ItemsSource?: any;
  PageTemplate?: any;
}

export interface NotificationCardProps extends ContentControlProps {
  IsClosing?: boolean;
  IsClosed?: boolean;
  NotificationType?: 'Information' | 'Success' | 'Warning' | 'Error';
  CloseOnClick?: boolean;
  onNotificationClosed?: () => void;
}

export interface NumericUpDownProps extends TemplatedControlProps {
  ref?: AvaloniaRef<NativeNumericUpDown> | ((el: AvaloniaRef<NativeNumericUpDown>) => void);
  AllowSpin?: boolean;
  ButtonSpinnerLocation?: any;
  ShowButtonSpinner?: boolean;
  ClipValueToMinMax?: boolean;
  NumberFormat?: any;
  FormatString?: string;
  Increment?: any;
  IsReadOnly?: boolean;
  Maximum?: any;
  Minimum?: any;
  ParsingNumberStyle?: any;
  Text?: string;
  TextConverter?: any;
  Value?: any;
  PlaceholderText?: string;
  Watermark?: string;
  PlaceholderForeground?: any;
  WatermarkForeground?: any;
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  TextAlignment?: any;
  InnerLeftContent?: any;
  InnerRightContent?: any;
  onValueChanged?: () => void;
}

export interface OverlayLayerProps extends CanvasProps {
  AvailableSize?: any;
}

export interface OverlayPopupHostProps extends ContentControlProps {
  Transform?: any;
  HostedVisualTreeRoot?: any;
}

export interface PageProps extends TemplatedControlProps {
  SafeAreaPadding?: string | number;
  Header?: any;
  HeaderTemplate?: any;
  Icon?: any;
  IconTemplate?: any;
  CurrentPage?: any;
  IsInNavigationPage?: boolean;
  Navigation?: any;
  onPageNavigationSystemBackButtonPressed?: () => void;
}

export interface PanelProps extends ControlProps {
  Background?: string;
  Children?: any;
  IsItemsHost?: boolean;
}

export interface PathProps extends ShapeProps {
  Data?: string;
}

export interface PathIconProps extends TemplatedControlProps {
  Data?: string;
}

export interface PipsPagerProps extends TemplatedControlProps {
  ref?: AvaloniaRef<NativePipsPager> | ((el: AvaloniaRef<NativePipsPager>) => void);
  MaxVisiblePips?: number;
  IsNextButtonVisible?: boolean;
  NumberOfPages?: number;
  Orientation?: 'Horizontal' | 'Vertical';
  IsPreviousButtonVisible?: boolean;
  SelectedPageIndex?: number;
  TemplateSettings?: any;
  PreviousButtonTheme?: any;
  NextButtonTheme?: any;
  onSelectedIndexChanged?: () => void;
}

export interface PolygonProps extends ShapeProps {
  Points?: JSX.Element | JSX.Element[];
  FillRule?: 'EvenOdd' | 'NonZero';
}

export interface PolylineProps extends ShapeProps {
  Points?: JSX.Element | JSX.Element[];
  FillRule?: 'EvenOdd' | 'NonZero';
}

export interface PopupProps extends ControlProps {
  WindowManagerAddShadowHint?: boolean;
  Child?: any;
  InheritsTransform?: boolean;
  IsOpen?: boolean;
  PlacementAnchor?: 'None' | 'Top' | 'Bottom' | 'VerticalMask' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight' | 'HorizontalMask' | 'AllMask';
  PlacementConstraintAdjustment?: 'None' | 'SlideX' | 'SlideY' | 'FlipX' | 'FlipY' | 'ResizeX' | 'ResizeY' | 'All';
  PlacementGravity?: 'None' | 'Top' | 'Bottom' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight';
  Placement?: 'Pointer' | 'Bottom' | 'Right' | 'Left' | 'Top' | 'Center' | 'AnchorAndGravity' | 'TopEdgeAlignedLeft' | 'TopEdgeAlignedRight' | 'BottomEdgeAlignedLeft' | 'BottomEdgeAlignedRight' | 'LeftEdgeAlignedTop' | 'LeftEdgeAlignedBottom' | 'RightEdgeAlignedTop' | 'RightEdgeAlignedBottom' | 'Custom';
  PlacementRect?: any;
  PlacementTarget?: any;
  CustomPopupPlacementCallback?: any;
  OverlayDismissEventPassThrough?: boolean;
  OverlayInputPassThroughElement?: any;
  HorizontalOffset?: number;
  IsLightDismissEnabled?: boolean;
  VerticalOffset?: number;
  Topmost?: boolean;
  TakesFocusFromNativeControl?: boolean;
  ShouldUseOverlayLayer?: boolean;
  IsUsingOverlayLayer?: boolean;
  DependencyResolver?: any;
  TopLevel?: any;
  LastPlacementTargetBounds?: any;
  PopupHost?: any;
  IsPointerOverPopup?: boolean;
}

export interface PopupRootProps extends WindowBaseProps {
  Transform?: any;
  WindowManagerAddShadowHint?: boolean;
  ParentTopLevel?: any;
}

export interface ProgressBarProps extends RangeBaseProps {
  ref?: AvaloniaRef<NativeProgressBar> | ((el: AvaloniaRef<NativeProgressBar>) => void);
  ContainerAnimationStartPosition?: number;
  ContainerAnimationEndPosition?: number;
  Container2AnimationStartPosition?: number;
  Container2AnimationEndPosition?: number;
  Container2Width?: number;
  ContainerWidth?: number;
  IndeterminateStartingOffset?: number;
  IndeterminateEndingOffset?: number;
  IsIndeterminate?: boolean;
  ShowProgressText?: boolean;
  ProgressTextFormat?: string;
  Orientation?: 'Horizontal' | 'Vertical';
  Percentage?: number;
  TemplateSettings?: any;
}

export interface RadioButtonProps extends ToggleButtonProps {
  GroupName?: string;
}

export interface RangeBaseProps extends TemplatedControlProps {
  Minimum?: number;
  Maximum?: number;
  Value?: number;
  SmallChange?: number;
  LargeChange?: number;
  onValueChanged?: () => void;
}

export interface RectangleProps extends ShapeProps {
  RadiusX?: number;
  RadiusY?: number;
}

export interface RowDefinitionProps {
  ref?: AvaloniaRef<NativeRowDefinition> | ((el: AvaloniaRef<NativeRowDefinition>) => void);
  MaxHeight?: number;
  MinHeight?: number;
  Height?: string | number;
  ActualHeight?: number;
  SharedSizeGroup?: string;
  Dispatcher?: any;
}

export interface RefreshContainerProps extends ContentControlProps {
  Visualizer?: any;
  PullDirection?: 'TopToBottom' | 'BottomToTop' | 'LeftToRight' | 'RightToLeft';
  IsMouseEnabled?: boolean;
  onRefreshRequested?: () => void;
}

export interface RefreshVisualizerProps extends ContentControlProps {
  RefreshVisualizerState?: any;
  Orientation?: 'Auto' | 'Normal' | 'Rotate90DegreesCounterclockwise' | 'Rotate270DegreesCounterclockwise';
  onRefreshRequested?: () => void;
}

export interface RelativePanelProps extends PanelProps {
  Above?: any;
  AlignBottomWithPanel?: boolean;
  AlignBottomWith?: any;
  AlignHorizontalCenterWithPanel?: boolean;
  AlignHorizontalCenterWith?: any;
  AlignLeftWithPanel?: boolean;
  AlignLeftWith?: any;
  AlignRightWithPanel?: boolean;
  AlignRightWith?: any;
  AlignTopWithPanel?: boolean;
  AlignTopWith?: any;
  AlignVerticalCenterWithPanel?: boolean;
  AlignVerticalCenterWith?: any;
  Below?: any;
  LeftOf?: any;
  RightOf?: any;
  Measured?: boolean;
  Element?: any;
  OriginDesiredSize?: any;
  Left?: number;
  Top?: number;
  Right?: number;
  Bottom?: number;
  OutgoingNodes?: any;
  AlignLeftWithNode?: any;
  AlignTopWithNode?: any;
  AlignRightWithNode?: any;
  AlignBottomWithNode?: any;
  LeftOfNode?: any;
  AboveNode?: any;
  RightOfNode?: any;
  BelowNode?: any;
}

export interface RepeatButtonProps extends ButtonProps {
  Interval?: number;
  Delay?: number;
}

export interface ReversibleStackPanelProps extends StackPanelProps {
  ReverseOrder?: boolean;
}

export interface RunProps extends TextElementProps {
  Text?: string;
  TextDecorations?: any;
  BaselineAlignment?: any;
}

export interface ScrollBarProps extends RangeBaseProps {
  ViewportSize?: number;
  Visibility?: 'Disabled' | 'Auto' | 'Hidden' | 'Visible';
  Orientation?: 'Horizontal' | 'Vertical';
  IsExpanded?: boolean;
  AllowAutoHide?: boolean;
  HideDelay?: any;
  ShowDelay?: any;
}

export interface ScrollContentPresenterProps extends ContentPresenterProps {
  CanHorizontallyScroll?: boolean;
  CanVerticallyScroll?: boolean;
  Extent?: any;
  Offset?: any;
  Viewport?: any;
  HorizontalSnapPointsType?: 'None' | 'Mandatory' | 'MandatorySingle';
  VerticalSnapPointsType?: 'None' | 'Mandatory' | 'MandatorySingle';
  HorizontalSnapPointsAlignment?: 'Near' | 'Center' | 'Far';
  VerticalSnapPointsAlignment?: 'Near' | 'Center' | 'Far';
  IsScrollChainingEnabled?: boolean;
}

export interface ScrollViewerProps extends ContentControlProps {
  ref?: AvaloniaRef<NativeScrollViewer> | ((el: AvaloniaRef<NativeScrollViewer>) => void);
  BringIntoViewOnFocusChange?: boolean;
  Extent?: any;
  Offset?: any;
  Viewport?: any;
  LargeChange?: any;
  SmallChange?: any;
  ScrollBarMaximum?: any;
  HorizontalScrollBarVisibility?: 'Disabled' | 'Auto' | 'Hidden' | 'Visible';
  HorizontalSnapPointsType?: 'None' | 'Mandatory' | 'MandatorySingle';
  VerticalSnapPointsType?: 'None' | 'Mandatory' | 'MandatorySingle';
  HorizontalSnapPointsAlignment?: 'Near' | 'Center' | 'Far';
  VerticalSnapPointsAlignment?: 'Near' | 'Center' | 'Far';
  VerticalScrollBarVisibility?: 'Disabled' | 'Auto' | 'Hidden' | 'Visible';
  IsExpanded?: boolean;
  AllowAutoHide?: boolean;
  IsScrollChainingEnabled?: boolean;
  IsScrollInertiaEnabled?: boolean;
  IsDeferredScrollingEnabled?: boolean;
  CurrentAnchor?: any;
  onScrollChanged?: () => void;
}

export interface SectorProps extends ShapeProps {
  StartAngle?: number;
  SweepAngle?: number;
}

export interface ShapeProps extends ControlProps {
  Fill?: string;
  Stretch?: 'None' | 'Fill' | 'Uniform' | 'UniformToFill';
  Stroke?: string;
  StrokeDashArray?: JSX.Element | JSX.Element[];
  StrokeDashOffset?: number;
  StrokeThickness?: number;
  StrokeLineCap?: 'Flat' | 'Round' | 'Square';
  StrokeJoin?: 'Bevel' | 'Miter' | 'Round';
  StrokeMiterLimit?: number;
}

export interface SelectableTextBlockProps extends TextBlockProps {
  SelectionStart?: number;
  SelectionEnd?: number;
  SelectedText?: string;
  SelectionBrush?: string;
  SelectionForegroundBrush?: string;
  CanCopy?: boolean;
  onCopyingToClipboard?: () => void;
}

export interface SelectingItemsControlProps extends ItemsControlProps {
  AutoScrollToSelectedItem?: boolean;
  SelectedIndex?: number;
  SelectedItem?: any;
  SelectedValue?: any;
  SelectedValueBinding?: any;
  IsSelected?: boolean;
  IsTextSearchEnabled?: boolean;
  WrapSelection?: boolean;
  UpdateCount?: number;
  Selection?: any;
  SelectedItems?: any;
  onIsSelectedChanged?: () => void;
  onSelectionChanged?: () => void;
}

export interface SeparatorProps extends TemplatedControlProps {
}

export interface SliderProps extends RangeBaseProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  Orientation?: 'Horizontal' | 'Vertical';
  IsDirectionReversed?: boolean;
  IsSnapToTickEnabled?: boolean;
  TickFrequency?: number;
  TickPlacement?: 'None' | 'TopLeft' | 'BottomRight' | 'Outside';
  Ticks?: JSX.Element | JSX.Element[];
}

export interface SpanProps extends TextElementProps {
  Inlines?: JSX.Element | JSX.Element[];
  TextDecorations?: any;
  BaselineAlignment?: any;
}

export interface SpinnerProps extends ContentControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  ValidSpinDirection?: 'None' | 'Increase' | 'Decrease';
  onSpin?: () => void;
}

export interface SplitButtonProps extends ContentControlProps {
  Command?: any;
  CommandParameter?: any;
  Flyout?: any;
  HotKey?: any;
  onClick?: () => void;
}

export interface SplitViewProps extends ContentControlProps {
  CompactPaneLength?: number;
  DisplayMode?: 'Inline' | 'CompactInline' | 'Overlay' | 'CompactOverlay';
  IsPaneOpen?: boolean;
  OpenPaneLength?: number;
  PaneBackground?: string;
  PanePlacement?: 'Left' | 'Right';
  Pane?: any;
  PaneTemplate?: any;
  UseLightDismissOverlayMode?: boolean;
  TemplateSettings?: any;
  onPaneClosed?: () => void;
  onPaneClosing?: () => void;
  onPaneOpened?: () => void;
  onPaneOpening?: () => void;
}

export interface StackPanelProps extends PanelProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  Spacing?: number;
  Orientation?: 'Horizontal' | 'Vertical';
  AreHorizontalSnapPointsRegular?: boolean;
  AreVerticalSnapPointsRegular?: boolean;
  onHorizontalSnapPointsChanged?: () => void;
  onVerticalSnapPointsChanged?: () => void;
}

export interface TabControlProps extends SelectingItemsControlProps {
  ref?: AvaloniaRef<NativeTabControl> | ((el: AvaloniaRef<NativeTabControl>) => void);
  TabStripPlacement?: 'Left' | 'Bottom' | 'Right' | 'Top';
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  ContentTemplate?: any;
  SelectedContent?: any;
  SelectedContentTemplate?: any;
  PageTransition?: any;
  IndicatorTemplate?: any;
}

export interface TabItemProps extends HeaderedContentControlProps {
  TabStripPlacement?: 'Left' | 'Bottom' | 'Right' | 'Top';
  IsSelected?: boolean;
  Icon?: any;
  IconTemplate?: any;
  IndicatorTemplate?: any;
}

export interface TabStripProps extends SelectingItemsControlProps {
}

export interface TabStripItemProps extends ListBoxItemProps {
}

export interface TabbedPageProps extends PageProps {
  TabPlacement?: 'Left' | 'Bottom' | 'Right' | 'Top';
  IsKeyboardNavigationEnabled?: boolean;
  IsGestureEnabled?: boolean;
  PageTransition?: any;
  IndicatorTemplate?: any;
  IsTabEnabled?: boolean;
  SelectedIndex?: number;
  SelectedPage?: any;
  Pages?: JSX.Element | JSX.Element[];
  ItemsSource?: any;
  PageTemplate?: any;
}

export interface TemplatedControlProps extends ControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  Background?: string;
  BackgroundSizing?: 'InnerBorderEdge' | 'OuterBorderEdge' | 'CenterBorder';
  BorderBrush?: string;
  BorderThickness?: string | number;
  CornerRadius?: string | number;
  FontFamily?: any;
  FontFeatures?: JSX.Element | JSX.Element[];
  FontSize?: number;
  FontStyle?: 'Normal' | 'Italic' | 'Oblique';
  FontWeight?: 'Thin' | 'ExtraLight' | 'UltraLight' | 'Light' | 'SemiLight' | 'Normal' | 'Regular' | 'Medium' | 'DemiBold' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'UltraBold' | 'Black' | 'Heavy' | 'Solid' | 'ExtraBlack' | 'UltraBlack';
  FontStretch?: 'UltraCondensed' | 'ExtraCondensed' | 'Condensed' | 'SemiCondensed' | 'Normal' | 'SemiExpanded' | 'Expanded' | 'ExtraExpanded' | 'UltraExpanded';
  Foreground?: string;
  LetterSpacing?: number;
  Padding?: string | number;
  IsTemplateFocusTarget?: boolean;
  onTemplateApplied?: () => void;
}

export interface TextBlockProps extends ControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  Background?: string;
  Padding?: string | number;
  FontFamily?: any;
  FontSize?: number;
  FontStyle?: 'Normal' | 'Italic' | 'Oblique';
  FontWeight?: 'Thin' | 'ExtraLight' | 'UltraLight' | 'Light' | 'SemiLight' | 'Normal' | 'Regular' | 'Medium' | 'DemiBold' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'UltraBold' | 'Black' | 'Heavy' | 'Solid' | 'ExtraBlack' | 'UltraBlack';
  FontStretch?: 'UltraCondensed' | 'ExtraCondensed' | 'Condensed' | 'SemiCondensed' | 'Normal' | 'SemiExpanded' | 'Expanded' | 'ExtraExpanded' | 'UltraExpanded';
  Foreground?: string;
  BaselineOffset?: number;
  LineHeight?: number;
  LineSpacing?: number;
  LetterSpacing?: number;
  MaxLines?: number;
  Text?: string;
  TextAlignment?: 'Left' | 'Center' | 'Right' | 'Start' | 'End' | 'DetectFromContent' | 'Justify';
  TextWrapping?: 'NoWrap' | 'Wrap' | 'WrapWithOverflow';
  TextTrimming?: any;
  TextDecorations?: any;
  FontFeatures?: JSX.Element | JSX.Element[];
  Inlines?: JSX.Element | JSX.Element[];
  TextLayout?: any;
  TextRuns?: JSX.Element | JSX.Element[];
}

export interface TextBoxProps extends TemplatedControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  IsInactiveSelectionHighlightEnabled?: boolean;
  ClearSelectionOnLostFocus?: boolean;
  AcceptsReturn?: boolean;
  AcceptsTab?: boolean;
  CaretIndex?: number;
  IsReadOnly?: boolean;
  PasswordChar?: any;
  SelectionBrush?: string;
  SelectionForegroundBrush?: string;
  CaretBrush?: string;
  CaretBlinkInterval?: any;
  SelectionStart?: number;
  SelectionEnd?: number;
  MaxLength?: number;
  MaxLines?: number;
  MinLines?: number;
  Text?: string;
  TextAlignment?: 'Left' | 'Center' | 'Right' | 'Start' | 'End' | 'DetectFromContent' | 'Justify';
  HorizontalContentAlignment?: 'Stretch' | 'Left' | 'Center' | 'Right';
  VerticalContentAlignment?: 'Stretch' | 'Top' | 'Center' | 'Bottom';
  TextWrapping?: 'NoWrap' | 'Wrap' | 'WrapWithOverflow';
  LineHeight?: number;
  PlaceholderText?: string;
  Watermark?: string;
  UseFloatingPlaceholder?: boolean;
  UseFloatingWatermark?: boolean;
  PlaceholderForeground?: string;
  WatermarkForeground?: string;
  NewLine?: string;
  InnerLeftContent?: any;
  InnerRightContent?: any;
  RevealPassword?: boolean;
  CanCut?: boolean;
  CanCopy?: boolean;
  CanPaste?: boolean;
  IsUndoEnabled?: boolean;
  UndoLimit?: number;
  CanUndo?: boolean;
  CanRedo?: boolean;
  CaretPosition?: number;
  onCopyingToClipboard?: () => void;
  onCuttingToClipboard?: () => void;
  onPastingFromClipboard?: () => void;
  onTextChanged?: () => void;
  onTextChanging?: () => void;
}

export interface TextElementProps {
  Background?: string;
  FontFamily?: any;
  FontFeatures?: JSX.Element | JSX.Element[];
  FontSize?: number;
  FontStyle?: 'Normal' | 'Italic' | 'Oblique';
  FontWeight?: 'Thin' | 'ExtraLight' | 'UltraLight' | 'Light' | 'SemiLight' | 'Normal' | 'Regular' | 'Medium' | 'DemiBold' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'UltraBold' | 'Black' | 'Heavy' | 'Solid' | 'ExtraBlack' | 'UltraBlack';
  FontStretch?: 'UltraCondensed' | 'ExtraCondensed' | 'Condensed' | 'SemiCondensed' | 'Normal' | 'SemiExpanded' | 'Expanded' | 'ExtraExpanded' | 'UltraExpanded';
  Foreground?: string;
  LetterSpacing?: number;
  DataContext?: any;
  Name?: string;
  Parent?: any;
  TemplatedParent?: any;
  Theme?: any;
  IsInitialized?: boolean;
  Classes?: any;
  Styles?: any;
  StyleKey?: any;
  ActualThemeVariant?: any;
  Transitions?: JSX.Element | JSX.Element[];
  Instance?: any;
  BaseValue?: any;
  Dispatcher?: any;
}

export interface TextPresenterProps extends ControlProps {
  ShowSelectionHighlight?: boolean;
  CaretIndex?: number;
  RevealPassword?: boolean;
  PasswordChar?: any;
  SelectionBrush?: string;
  SelectionForegroundBrush?: string;
  CaretBrush?: string;
  CaretBlinkInterval?: any;
  SelectionStart?: number;
  SelectionEnd?: number;
  Text?: string;
  PreeditText?: string;
  PreeditTextCursorPosition?: number;
  TextAlignment?: 'Left' | 'Center' | 'Right' | 'Start' | 'End' | 'DetectFromContent' | 'Justify';
  TextWrapping?: 'NoWrap' | 'Wrap' | 'WrapWithOverflow';
  LineHeight?: number;
  LetterSpacing?: number;
  Background?: string;
}

export interface TextSelectionHandleProps extends ThumbProps {
}

export interface TextSelectorLayerProps extends CanvasProps {
  AvailableSize?: any;
}

export interface ThemeVariantScopeProps extends DecoratorProps {
  RequestedThemeVariant?: any;
}

export interface ThumbProps extends TemplatedControlProps {
  onDragStarted?: () => void;
  onDragDelta?: () => void;
  onDragCompleted?: () => void;
}

export interface TickBarProps extends ControlProps {
  Fill?: string;
  Minimum?: number;
  Maximum?: number;
  TickFrequency?: number;
  Orientation?: 'Horizontal' | 'Vertical';
  Ticks?: JSX.Element | JSX.Element[];
  IsDirectionReversed?: boolean;
  Placement?: 'Left' | 'Top' | 'Right' | 'Bottom';
  ReservedSpace?: any;
}

export interface TimePickerProps extends TemplatedControlProps {
  MinuteIncrement?: number;
  SecondIncrement?: number;
  ClockIdentifier?: string;
  UseSeconds?: boolean;
  SelectedTime?: any;
}

export interface TimePickerPresenterProps extends TemplatedControlProps {
  MinuteIncrement?: number;
  SecondIncrement?: number;
  ClockIdentifier?: string;
  UseSeconds?: boolean;
  Time?: any;
}

export interface ToggleButtonProps extends ButtonProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  IsChecked?: boolean;
  IsThreeState?: boolean;
  onIsCheckedChanged?: () => void;
}

export interface ToggleSplitButtonProps extends SplitButtonProps {
  IsChecked?: boolean;
  onIsCheckedChanged?: () => void;
}

export interface ToggleSwitchProps extends ToggleButtonProps {
  OffContent?: any;
  OffContentTemplate?: any;
  OnContent?: any;
  OnContentTemplate?: any;
  KnobTransitions?: JSX.Element | JSX.Element[];
  OffContentPresenter?: any;
  OnContentPresenter?: any;
}

export interface ToolTipProps extends ContentControlProps {
  Tip?: any;
  IsOpen?: boolean;
  Placement?: 'Pointer' | 'Bottom' | 'Right' | 'Left' | 'Top' | 'Center' | 'AnchorAndGravity' | 'TopEdgeAlignedLeft' | 'TopEdgeAlignedRight' | 'BottomEdgeAlignedLeft' | 'BottomEdgeAlignedRight' | 'LeftEdgeAlignedTop' | 'LeftEdgeAlignedBottom' | 'RightEdgeAlignedTop' | 'RightEdgeAlignedBottom' | 'Custom';
  HorizontalOffset?: number;
  VerticalOffset?: number;
  CustomPopupPlacementCallback?: any;
  ShowDelay?: number;
  BetweenShowDelay?: number;
  ShowOnDisabled?: boolean;
  ServiceEnabled?: boolean;
  onToolTipOpening?: () => void;
}

export interface TrackProps extends ControlProps {
  Minimum?: number;
  Maximum?: number;
  Value?: number;
  ViewportSize?: number;
  Orientation?: 'Horizontal' | 'Vertical';
  Thumb?: any;
  IncreaseButton?: any;
  DecreaseButton?: any;
  IsDirectionReversed?: boolean;
  IgnoreThumbDrag?: boolean;
  DeferThumbDrag?: boolean;
}

export interface TransitioningContentControlProps extends ContentControlProps {
  PageTransition?: any;
  IsTransitionReversed?: boolean;
  onTransitionCompleted?: () => void;
}

export interface TreeViewProps extends ItemsControlProps {
  AutoScrollToSelectedItem?: boolean;
  SelectedItem?: any;
  SelectedItems?: any;
  SelectionMode?: 'Single' | 'Multiple' | 'Toggle' | 'AlwaysSelected';
  onSelectionChanged?: () => void;
}

export interface TreeViewItemProps extends HeaderedItemsControlProps {
  IsExpanded?: boolean;
  IsSelected?: boolean;
  Level?: number;
  onExpanded?: () => void;
  onCollapsed?: () => void;
}

export interface UniformGridProps extends PanelProps {
  Rows?: number;
  Columns?: number;
  FirstColumn?: number;
  RowSpacing?: number;
  ColumnSpacing?: number;
}

export interface UserControlProps extends ContentControlProps {
}

export interface ViewboxProps extends ControlProps {
  Stretch?: 'None' | 'Fill' | 'Uniform' | 'UniformToFill';
  StretchDirection?: 'UpOnly' | 'DownOnly' | 'Both';
  Child?: any;
}

export interface VirtualizingCarouselPanelProps extends PanelProps {
  ItemIndex?: number;
  Control?: any;
  ItemContainerGenerator?: any;
}

export interface VirtualizingStackPanelProps extends PanelProps {
  Orientation?: 'Horizontal' | 'Vertical';
  AreHorizontalSnapPointsRegular?: boolean;
  AreVerticalSnapPointsRegular?: boolean;
  CacheLength?: number;
  FirstRealizedIndex?: number;
  LastRealizedIndex?: number;
  ItemContainerGenerator?: any;
  onHorizontalSnapPointsChanged?: () => void;
  onVerticalSnapPointsChanged?: () => void;
}

export interface VisualLayerManagerProps extends DecoratorProps {
  EnableAdornerLayer?: boolean;
  EnableOverlayLayer?: boolean;
  EnableTextSelectorLayer?: boolean;
}

export interface WindowProps extends WindowBaseProps {
  ref?: AvaloniaRef<NativeWindow> | ((el: AvaloniaRef<NativeWindow>) => void);
  SizeToContent?: 'Manual' | 'Width' | 'Height' | 'WidthAndHeight';
  ExtendClientAreaToDecorationsHint?: boolean;
  ExtendClientAreaTitleBarHeightHint?: number;
  IsExtendedIntoWindowDecorations?: boolean;
  WindowDecorationMargin?: string | number;
  OffScreenMargin?: string | number;
  WindowDecorations?: any;
  WindowDecorationsTheme?: any;
  ShowActivated?: boolean;
  ShowInTaskbar?: boolean;
  ClosingBehavior?: 'OwnerAndChildWindows' | 'OwnerWindowOnly';
  WindowState?: 'Normal' | 'Minimized' | 'Maximized' | 'FullScreen';
  Title?: string;
  Icon?: any;
  WindowStartupLocation?: 'Manual' | 'CenterScreen' | 'CenterOwner';
  CanResize?: boolean;
  CanMinimize?: boolean;
  CanMaximize?: boolean;
  OwnedWindows?: JSX.Element | JSX.Element[];
  IsDialog?: boolean;
  onWindowClosed?: () => void;
  onWindowOpened?: () => void;
}

export interface WindowBaseProps extends ContentControlProps {
  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);
  IsActive?: boolean;
  Owner?: any;
  Topmost?: boolean;
  DesktopScaling?: number;
  ClientSize?: any;
  FrameSize?: any;
  TransparencyLevelHint?: string | string[] | any;
  ActualTransparencyLevel?: string | any;
  TransparencyBackgroundFallback?: string;
  RequestedThemeVariant?: any;
  SystemBarColor?: any;
  AutoSafeAreaPadding?: boolean;
  PlatformImpl?: any;
  RendererDiagnostics?: any;
  RenderScaling?: number;
  StorageProvider?: any;
  InsetsManager?: any;
  InputPane?: any;
  Launcher?: any;
  Screens?: any;
  Clipboard?: any;
  FocusManager?: any;
}

export interface WindowNotificationManagerProps extends TemplatedControlProps {
  Position?: 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight' | 'TopCenter' | 'BottomCenter';
  MaxItems?: number;
}

export interface WrapPanelProps extends PanelProps {
  ItemSpacing?: number;
  LineSpacing?: number;
  Orientation?: 'Horizontal' | 'Vertical';
  ItemsAlignment?: any;
  ItemWidth?: number;
  ItemHeight?: number;
}

export function AccessText(props: AccessTextProps) {
  return <accessText {...props} />;
}

export function AdornerLayer(props: AdornerLayerProps) {
  return <adornerLayer {...props} />;
}

export function Arc(props: ArcProps) {
  return <arc {...props} />;
}

export function AutoCompleteBox(props: AutoCompleteBoxProps) {
  return <autoCompleteBox {...props} />;
}

export function Border(props: BorderProps) {
  return <border {...props} />;
}

export function Button(props: ButtonProps) {
  return <button {...props} />;
}

export function ButtonSpinner(props: ButtonSpinnerProps) {
  return <buttonSpinner {...props} />;
}

export function Calendar(props: CalendarProps) {
  return <calendar {...props} />;
}

export function CalendarButton(props: CalendarButtonProps) {
  return <calendarButton {...props} />;
}

export function CalendarDatePicker(props: CalendarDatePickerProps) {
  return <calendarDatePicker {...props} />;
}

export function CalendarDayButton(props: CalendarDayButtonProps) {
  return <calendarDayButton {...props} />;
}

export function CalendarItem(props: CalendarItemProps) {
  return <calendarItem {...props} />;
}

export function Canvas(props: CanvasProps) {
  return <canvas {...props} />;
}

export function Carousel(props: CarouselProps) {
  return <carousel {...props} />;
}

export function CarouselPage(props: CarouselPageProps) {
  return <carouselPage {...props} />;
}

export function CheckBox(props: CheckBoxProps) {
  return <checkBox {...props} />;
}

export function ColumnDefinition(props: ColumnDefinitionProps) {
  return <columnDefinition {...props} />;
}

export function ColorPicker(props: ColorPickerProps) {
  return <colorPicker {...props} />;
}

export function ColorPreviewer(props: ColorPreviewerProps) {
  return <colorPreviewer {...props} />;
}

export function ColorSlider(props: ColorSliderProps) {
  return <colorSlider {...props} />;
}

export function ColorSpectrum(props: ColorSpectrumProps) {
  return <colorSpectrum {...props} />;
}

export function ColorView(props: ColorViewProps) {
  return <colorView {...props} />;
}

export function CommandBar(props: CommandBarProps) {
  return <commandBar {...props} />;
}

export function CommandBarButton(props: CommandBarButtonProps) {
  return <commandBarButton {...props} />;
}

export function CommandBarSeparator(props: CommandBarSeparatorProps) {
  return <commandBarSeparator {...props} />;
}

export function CommandBarToggleButton(props: CommandBarToggleButtonProps) {
  return <commandBarToggleButton {...props} />;
}

export function ComboBox(props: ComboBoxProps) {
  return <comboBox {...props} />;
}

export function ComboBoxItem(props: ComboBoxItemProps) {
  return <comboBoxItem {...props} />;
}

export function ContentControl(props: ContentControlProps) {
  return <contentControl {...props} />;
}

export function ContentPage(props: ContentPageProps) {
  return <contentPage {...props} />;
}

export function ContentPresenter(props: ContentPresenterProps) {
  return <contentPresenter {...props} />;
}

export function ContextMenu(props: ContextMenuProps) {
  return <contextMenu {...props} />;
}

export function Control(props: ControlProps) {
  return <control {...props} />;
}

export function DataValidationErrors(props: DataValidationErrorsProps) {
  return <dataValidationErrors {...props} />;
}

export function DatePicker(props: DatePickerProps) {
  return <datePicker {...props} />;
}

export function DatePickerPresenter(props: DatePickerPresenterProps) {
  return <datePickerPresenter {...props} />;
}

export function DateTimePickerPanel(props: DateTimePickerPanelProps) {
  return <dateTimePickerPanel {...props} />;
}

export function Decorator(props: DecoratorProps) {
  return <decorator {...props} />;
}

export function DockPanel(props: DockPanelProps) {
  return <dockPanel {...props} />;
}

export function DropDownButton(props: DropDownButtonProps) {
  return <dropDownButton {...props} />;
}

export function Ellipse(props: EllipseProps) {
  return <ellipse {...props} />;
}

export function EmbeddableControlRoot(props: EmbeddableControlRootProps) {
  return <embeddableControlRoot {...props} />;
}

export function Expander(props: ExpanderProps) {
  return <expander {...props} />;
}

export function ExperimentalAcrylicBorder(props: ExperimentalAcrylicBorderProps) {
  return <experimentalAcrylicBorder {...props} />;
}

export function Flyout(props: FlyoutProps) {
  return <flyout {...props} />;
}

export function FlyoutPresenter(props: FlyoutPresenterProps) {
  return <flyoutPresenter {...props} />;
}

export function Grid(props: GridProps) {
  return <grid {...props} />;
}

export function GridSplitter(props: GridSplitterProps) {
  return <gridSplitter {...props} />;
}

export function HeaderedContentControl(props: HeaderedContentControlProps) {
  return <headeredContentControl {...props} />;
}

export function HeaderedItemsControl(props: HeaderedItemsControlProps) {
  return <headeredItemsControl {...props} />;
}

export function HeaderedSelectingItemsControl(props: HeaderedSelectingItemsControlProps) {
  return <headeredSelectingItemsControl {...props} />;
}

export function HyperlinkButton(props: HyperlinkButtonProps) {
  return <hyperlinkButton {...props} />;
}

export function Image(props: ImageProps) {
  return <image {...props} />;
}

export function ItemsControl(props: ItemsControlProps) {
  return <itemsControl {...props} />;
}

export function ItemsPresenter(props: ItemsPresenterProps) {
  return <itemsPresenter {...props} />;
}

export function Label(props: LabelProps) {
  return <label {...props} />;
}

export function LayoutTransformControl(props: LayoutTransformControlProps) {
  return <layoutTransformControl {...props} />;
}

export function Line(props: LineProps) {
  return <line {...props} />;
}

export function ListBox(props: ListBoxProps) {
  return <listBox {...props} />;
}

export function ListBoxItem(props: ListBoxItemProps) {
  return <listBoxItem {...props} />;
}

export function MaskedTextBox(props: MaskedTextBoxProps) {
  return <maskedTextBox {...props} />;
}

export function Menu(props: MenuProps) {
  return <menu {...props} />;
}

export function MenuFlyout(props: MenuFlyoutProps) {
  return <menuFlyout {...props} />;
}

export function MenuFlyoutPresenter(props: MenuFlyoutPresenterProps) {
  return <menuFlyoutPresenter {...props} />;
}

export function MenuItem(props: MenuItemProps) {
  return <menuItem {...props} />;
}

export function NativeControlHost(props: NativeControlHostProps) {
  return <nativeControlHost {...props} />;
}

export function NativeMenu(props: NativeMenuProps) {
  return <nativeMenu {...props} />;
}

export function NativeMenuBar(props: NativeMenuBarProps) {
  return <nativeMenuBar {...props} />;
}

export function NativeMenuItem(props: NativeMenuItemProps) {
  return <nativeMenuItem {...props} />;
}

export function NavigationPage(props: NavigationPageProps) {
  return <navigationPage {...props} />;
}

export function NotificationCard(props: NotificationCardProps) {
  return <notificationCard {...props} />;
}

export function NumericUpDown(props: NumericUpDownProps) {
  return <numericUpDown {...props} />;
}

export function OverlayLayer(props: OverlayLayerProps) {
  return <overlayLayer {...props} />;
}

export function OverlayPopupHost(props: OverlayPopupHostProps) {
  return <overlayPopupHost {...props} />;
}

export function Page(props: PageProps) {
  return <page {...props} />;
}

export function Panel(props: PanelProps) {
  return <panel {...props} />;
}

export function Path(props: PathProps) {
  return <path {...props} />;
}

export function PathIcon(props: PathIconProps) {
  return <pathIcon {...props} />;
}

export function PipsPager(props: PipsPagerProps) {
  return <pipsPager {...props} />;
}

export function Polygon(props: PolygonProps) {
  return <polygon {...props} />;
}

export function Polyline(props: PolylineProps) {
  return <polyline {...props} />;
}

export function Popup(props: PopupProps) {
  return <popup {...props} />;
}

export function PopupRoot(props: PopupRootProps) {
  return <popupRoot {...props} />;
}

export function ProgressBar(props: ProgressBarProps) {
  return <progressBar {...props} />;
}

export function RadioButton(props: RadioButtonProps) {
  return <radioButton {...props} />;
}

export function RangeBase(props: RangeBaseProps) {
  return <rangeBase {...props} />;
}

export function Rectangle(props: RectangleProps) {
  return <rectangle {...props} />;
}

export function RowDefinition(props: RowDefinitionProps) {
  return <rowDefinition {...props} />;
}

export function RefreshContainer(props: RefreshContainerProps) {
  return <refreshContainer {...props} />;
}

export function RefreshVisualizer(props: RefreshVisualizerProps) {
  return <refreshVisualizer {...props} />;
}

export function RelativePanel(props: RelativePanelProps) {
  return <relativePanel {...props} />;
}

export function RepeatButton(props: RepeatButtonProps) {
  return <repeatButton {...props} />;
}

export function ReversibleStackPanel(props: ReversibleStackPanelProps) {
  return <reversibleStackPanel {...props} />;
}

export function Run(props: RunProps) {
  return <run {...props} />;
}

export function ScrollBar(props: ScrollBarProps) {
  return <scrollBar {...props} />;
}

export function ScrollContentPresenter(props: ScrollContentPresenterProps) {
  return <scrollContentPresenter {...props} />;
}

export function ScrollViewer(props: ScrollViewerProps) {
  return <scrollViewer {...props} />;
}

export function Sector(props: SectorProps) {
  return <sector {...props} />;
}

export function Shape(props: ShapeProps) {
  return <shape {...props} />;
}

export function SelectableTextBlock(props: SelectableTextBlockProps) {
  return <selectableTextBlock {...props} />;
}

export function SelectingItemsControl(props: SelectingItemsControlProps) {
  return <selectingItemsControl {...props} />;
}

export function Separator(props: SeparatorProps) {
  return <separator {...props} />;
}

export function Slider(props: SliderProps) {
  return <slider {...props} />;
}

export function Span(props: SpanProps) {
  return <span {...props} />;
}

export function Spinner(props: SpinnerProps) {
  return <spinner {...props} />;
}

export function SplitButton(props: SplitButtonProps) {
  return <splitButton {...props} />;
}

export function SplitView(props: SplitViewProps) {
  return <splitView {...props} />;
}

export function StackPanel(props: StackPanelProps) {
  return <stackPanel {...props} />;
}

export function TabControl(props: TabControlProps) {
  return <tabControl {...props} />;
}

export function TabItem(props: TabItemProps) {
  return <tabItem {...props} />;
}

export function TabStrip(props: TabStripProps) {
  return <tabStrip {...props} />;
}

export function TabStripItem(props: TabStripItemProps) {
  return <tabStripItem {...props} />;
}

export function TabbedPage(props: TabbedPageProps) {
  return <tabbedPage {...props} />;
}

export function TemplatedControl(props: TemplatedControlProps) {
  return <templatedControl {...props} />;
}

export function TextBlock(props: TextBlockProps) {
  return <textBlock {...props} />;
}

export function TextBox(props: TextBoxProps) {
  return <textBox {...props} />;
}

export function TextElement(props: TextElementProps) {
  return <textElement {...props} />;
}

export function TextPresenter(props: TextPresenterProps) {
  return <textPresenter {...props} />;
}

export function TextSelectionHandle(props: TextSelectionHandleProps) {
  return <textSelectionHandle {...props} />;
}

export function TextSelectorLayer(props: TextSelectorLayerProps) {
  return <textSelectorLayer {...props} />;
}

export function ThemeVariantScope(props: ThemeVariantScopeProps) {
  return <themeVariantScope {...props} />;
}

export function Thumb(props: ThumbProps) {
  return <thumb {...props} />;
}

export function TickBar(props: TickBarProps) {
  return <tickBar {...props} />;
}

export function TimePicker(props: TimePickerProps) {
  return <timePicker {...props} />;
}

export function TimePickerPresenter(props: TimePickerPresenterProps) {
  return <timePickerPresenter {...props} />;
}

export function ToggleButton(props: ToggleButtonProps) {
  return <toggleButton {...props} />;
}

export function ToggleSplitButton(props: ToggleSplitButtonProps) {
  return <toggleSplitButton {...props} />;
}

export function ToggleSwitch(props: ToggleSwitchProps) {
  return <toggleSwitch {...props} />;
}

export function ToolTip(props: ToolTipProps) {
  return <toolTip {...props} />;
}

export function Track(props: TrackProps) {
  return <track {...props} />;
}

export function TransitioningContentControl(props: TransitioningContentControlProps) {
  return <transitioningContentControl {...props} />;
}

export function TreeView(props: TreeViewProps) {
  return <treeView {...props} />;
}

export function TreeViewItem(props: TreeViewItemProps) {
  return <treeViewItem {...props} />;
}

export function UniformGrid(props: UniformGridProps) {
  return <uniformGrid {...props} />;
}

export function UserControl(props: UserControlProps) {
  return <userControl {...props} />;
}

export function Viewbox(props: ViewboxProps) {
  return <viewbox {...props} />;
}

export function VirtualizingCarouselPanel(props: VirtualizingCarouselPanelProps) {
  return <virtualizingCarouselPanel {...props} />;
}

export function VirtualizingStackPanel(props: VirtualizingStackPanelProps) {
  return <virtualizingStackPanel {...props} />;
}

export function VisualLayerManager(props: VisualLayerManagerProps) {
  return <visualLayerManager {...props} />;
}

export function Window(props: WindowProps) {
  return <window {...props} />;
}

export function WindowBase(props: WindowBaseProps) {
  return <windowBase {...props} />;
}

export function WindowNotificationManager(props: WindowNotificationManagerProps) {
  return <windowNotificationManager {...props} />;
}

export function WrapPanel(props: WrapPanelProps) {
  return <wrapPanel {...props} />;
}

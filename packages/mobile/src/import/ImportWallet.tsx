import Button, { BtnTypes } from '@celo/react-components/components/Button.v2'
import KeyboardAwareScrollView from '@celo/react-components/components/KeyboardAwareScrollView'
import KeyboardSpacer from '@celo/react-components/components/KeyboardSpacer'
import colors from '@celo/react-components/styles/colors.v2'
import fontStyles from '@celo/react-components/styles/fonts.v2'
import { HeaderHeightContext, StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { WithTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text, View } from 'react-native'
import { SafeAreaConsumer } from 'react-native-safe-area-view'
import { connect } from 'react-redux'
import { hideAlert } from 'src/alert/actions'
import CeloAnalytics from 'src/analytics/CeloAnalytics'
import { CustomEventNames } from 'src/analytics/constants'
import {
  formatBackupPhraseOnEdit,
  formatBackupPhraseOnSubmit,
  isValidBackupPhrase,
} from 'src/backup/utils'
import CodeInput, { CodeInputStatus } from 'src/components/CodeInput'
import i18n, { Namespaces, withTranslation } from 'src/i18n'
import { importBackupPhrase } from 'src/import/actions'
import { HeaderTitleWithSubtitle, nuxNavigationOptions } from 'src/navigator/Headers.v2'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import { RootState } from 'src/redux/reducers'
import { isAppConnected } from 'src/redux/selectors'

interface State {
  keyboardVisible: boolean
  backupPhrase: string
}

interface DispatchProps {
  importBackupPhrase: typeof importBackupPhrase
  hideAlert: typeof hideAlert
}

interface StateProps {
  isImportingWallet: boolean
  connected: boolean
}

type OwnProps = StackScreenProps<StackParamList, Screens.ImportWallet>

type Props = StateProps & DispatchProps & WithTranslation & OwnProps

const mapStateToProps = (state: RootState): StateProps => {
  return {
    isImportingWallet: state.imports.isImportingWallet,
    connected: isAppConnected(state),
  }
}

export class ImportWallet extends React.Component<Props, State> {
  static navigationOptions = {
    ...nuxNavigationOptions,
    headerTitle: () => (
      <HeaderTitleWithSubtitle
        title={i18n.t('nuxNamePin1:importIt')}
        subTitle={i18n.t('onboarding:step', { step: '3' })}
      />
    ),
  }

  state = {
    backupPhrase: '',
    keyboardVisible: false,
  }
  componentDidMount() {
    this.props.navigation.addListener('focus', this.checkCleanBackupPhrase)
  }

  componentWillUnmount() {
    this.props.navigation.removeListener('focus', this.checkCleanBackupPhrase)
  }

  checkCleanBackupPhrase = () => {
    const { route, navigation } = this.props
    if (route.params?.clean) {
      this.setState({
        backupPhrase: '',
      })
      navigation.setParams({ clean: false })
    }
  }

  setBackupPhrase = (input: string) => {
    this.props.hideAlert()
    this.setState({
      backupPhrase: formatBackupPhraseOnEdit(input),
    })
  }

  onToggleKeyboard = (visible: boolean) => {
    this.setState({ keyboardVisible: visible })
  }

  onPressRestore = () => {
    Keyboard.dismiss()
    this.props.hideAlert()
    CeloAnalytics.track(CustomEventNames.import_wallet_submit)

    const formattedPhrase = formatBackupPhraseOnSubmit(this.state.backupPhrase)
    this.setState({
      backupPhrase: formattedPhrase,
    })

    this.props.importBackupPhrase(formattedPhrase, false)
  }

  shouldShowClipboard = (clipboardContent: string): boolean => {
    return isValidBackupPhrase(clipboardContent)
  }

  render() {
    const { backupPhrase, keyboardVisible } = this.state
    const { t, isImportingWallet, connected } = this.props

    let codeStatus = CodeInputStatus.INPUTTING
    if (isImportingWallet) {
      codeStatus = CodeInputStatus.PROCESSING
    }
    return (
      <HeaderHeightContext.Consumer>
        {(headerHeight) => (
          <SafeAreaConsumer>
            {(insets) => (
              <View style={styles.container}>
                <KeyboardAwareScrollView
                  style={headerHeight ? { marginTop: headerHeight } : undefined}
                  contentContainerStyle={[
                    styles.scrollContainer,
                    !keyboardVisible && insets && { marginBottom: insets.bottom },
                  ]}
                  keyboardShouldPersistTaps={'always'}
                >
                  <CodeInput
                    label={t('global:accountKey')}
                    status={codeStatus}
                    inputValue={backupPhrase}
                    inputPlaceholder={t('importExistingKey.keyPlaceholder')}
                    multiline={true}
                    onInputChange={this.setBackupPhrase}
                    shouldShowClipboard={this.shouldShowClipboard}
                    testID="ImportWalletBackupKeyInputField"
                  />
                  <Text style={styles.explanation}>{t('importExistingKey.explanation')}</Text>
                  <Button
                    style={styles.button}
                    testID="ImportWalletButton"
                    onPress={this.onPressRestore}
                    text={t('global:restore')}
                    type={BtnTypes.ONBOARDING}
                    disabled={isImportingWallet || !isValidBackupPhrase(backupPhrase) || !connected}
                  />

                  <KeyboardSpacer />
                </KeyboardAwareScrollView>
                <KeyboardSpacer onToggle={this.onToggleKeyboard} />
              </View>
            )}
          </SafeAreaConsumer>
        )}
      </HeaderHeightContext.Consumer>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.onboardingBackground,
  },
  scrollContainer: {
    padding: 16,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  loadingSpinnerContainer: {
    marginVertical: 20,
  },
  button: {
    paddingVertical: 16,
  },
  wordsInput: {
    minHeight: 80,
  },
  explanation: {
    ...fontStyles.regular,
    paddingHorizontal: 8,
    paddingTop: 16,
  },
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
  importBackupPhrase,
  hideAlert,
})(withTranslation<Props>(Namespaces.onboarding)(ImportWallet))

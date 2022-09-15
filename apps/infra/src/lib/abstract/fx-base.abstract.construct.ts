import { Construct } from 'constructs'

import { FxBaseStack } from './fx-base.abstract.stack'

export interface FxBaseConstructProps {}

export abstract class FxBaseConstruct extends Construct {
  protected readonly _parent: Readonly<FxBaseStack>
  protected projectTag: string

  constructor(parent: FxBaseStack, name: string, _props: FxBaseConstructProps) {
    super(parent, name)

    this._parent = parent
    this.projectTag = parent.getProjectTag()
  }

  protected getProjectTag() {
    return this._parent.getProjectTag()
  }

  protected getDeployStage() {
    return this._parent.getDeployStage()
  }

  protected getDeployStageTag() {
    return this._parent.getDeployStageTag()
  }
}

import { CommonUtil } from './../utils/common';
import { IConditionFunction } from './IConditionFunction';
import { AccessControlError } from '../core';
import { ConditionUtil } from './util';

/**
 * Equals condition
 *
 *  @author Dilip Kola <dilip@tensult.com>
 */

export class EqualsCondition implements IConditionFunction {

    evaluate(args?: any, context?: any) {
        if (!args) {
            return true;
        }

        if (!context) {
            return false;
        }

        if (CommonUtil.type(args) !== 'object') {
            throw new AccessControlError('EqualsCondition expects type of args to be object')
        }

        return Object.keys(args).every((key) => {
            const contextKeyValue = ConditionUtil.getValueByKey(context, key);
            return CommonUtil.matchesAnyElement(args[key], (elm) => {
                return contextKeyValue && ConditionUtil.getValueByPath(context, elm) === contextKeyValue;
            });
        });
    }
}
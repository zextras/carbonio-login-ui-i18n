/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useCallback, useMemo, useContext, useState } from 'react';
import {
	Container,
	Input,
	Padding,
	Row,
	Button,
	Text,
	Icon,
	Switch,
	Divider,
	Tooltip,
	ChipInput
} from '@zextras/carbonio-design-system';
import { setDefaults, useTranslation } from 'react-i18next';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { timeZoneList, localeList, AccountStatus } from '../../../../utility/utils';
import { fetchSoap } from '../../../../../services/listOTP-service';

const EditAccountSecuritySection: FC = () => {
	const conext = useContext(AccountContext);
	const { accountDetail, setAccountDetail, directMemberList, inDirectMemberList } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);

	const [t] = useTranslation();

	const getListOtp = (): void => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxAuth',
			action: 'list_totp_command',
			account: `${accountDetail?.uid}@${domainName}`
		}).then((res) => {
			console.log('res', res);
			// if (res.ok) {
			// 	setQrData(res.response.secret);
			// 	setPinCodes(res.response.static_otp_codes);
			// 	setShowOtpOptionSection(false);
			// } else {
			// 	// setErrorLabel(t('error.alreadyInUse'));
			// }
		});
	};
	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.OTP', 'OTP')}
					</Text>
				</Row>
				<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
					<Padding right="large">
						<Button
							type="outlined"
							label={t('label.NEW_OTP', 'NEW OTP')}
							icon="PlusOutline"
							iconPlacement="right"
							color="primary"
							height={44}
							onClick={getListOtp}
						/>
					</Padding>
					<Button
						type="outlined"
						label={t('label.DELETE', 'DELETE')}
						icon="CloseOutline"
						iconPlacement="right"
						color="error"
						height={44}
						disabled
					/>
				</Row>
				<Row
					padding={{ top: 'large', left: 'large' }}
					width="100%"
					mainAlignment="space-between"
				></Row>
			</Row>
		</Container>
	);
};

export default EditAccountSecuritySection;

/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const modifyDistributionList = async (dlId: string, a?: any[]): Promise<any> => {
	const request: any = {
		ModifyDistributionListRequest: {
			_jsns: 'urn:zimbraAdmin',
			id: dlId
		}
	};
	if (a) {
		request.ModifyDistributionListRequest.a = a;
	}
	return fetch(`/service/admin/soap/ModifyDistributionListRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: request
		})
	});
};

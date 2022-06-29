/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getDistributionList = async (
	dlId: string,
	dlName: string,
	offset?: number,
	limit?: number
): Promise<any> => {
	const request: any = {
		GetDistributionListRequest: {
			_jsns: 'urn:zimbraAdmin',
			offset: offset || 0,
			limit: limit || 0
		}
	};
	if (dlId) {
		request.GetDistributionListRequest.dl = {
			by: 'id',
			_content: dlId
		};
	}
	if (dlName) {
		request.GetDistributionListRequest.name = dlName;
	}
	return fetch(`/service/admin/soap/GetDistributionListRequest`, {
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

/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getDistributionListMembership = async (dlId: string): Promise<any> => {
	const request: any = {
		GetDistributionListMembershipRequest: {
			_jsns: 'urn:zimbraAdmin',
			dl: {
				by: 'id',
				_content: dlId
			}
		}
	};

	return fetch(`/service/admin/soap/GetDistributionListMembershipRequest`, {
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

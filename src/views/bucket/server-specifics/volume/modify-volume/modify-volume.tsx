/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Input,
	Padding,
	Text,
	Button,
	IconButton,
	Divider,
	Switch,
	Select,
	useSnackbar,
	Radio
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { BucketTypeItems, volumeAllocationList, volumeTypeList } from '../../../../utility/utils';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import { fetchSoap } from '../../../../../services/bucket-service';
import {
	ALIBABA,
	CEPH,
	CLOUDIAN,
	CUSTOM_S3,
	EMC,
	FILEBLOB,
	OPENIO,
	PRIMARY_TYPE_VALUE,
	S3,
	SCALITYS3,
	SECONDARY_TYPE_VALUE,
	SWIFT,
	UNUSED,
	USAGE_IN_EXTERNAL_BACKUP
} from '../../../../../constants';
import { useBucketServersListStore } from '../../../../../store/bucket-server-list/store';
import { useServerStore } from '../../../../../store/server/store';
import ListRow from '../../../../list/list-row';
import { AdvancedVolumeContext } from '../create-volume/advanced-create-volume/create-advanced-volume-context';
import { useBucketVolumeStore } from '../../../../../store/bucket-volume/store';

const ModifyVolume: FC<{
	setmodifyVolumeToggle: any;
	volumeDetail: any;
	changeSelectedVolume: any;
	getAllVolumesRequest: any;
	selectedServerId: string;
	volumeList: any;
}> = ({
	setmodifyVolumeToggle,
	volumeDetail,
	changeSelectedVolume,
	getAllVolumesRequest,
	selectedServerId,
	volumeList
}) => {
	const { t } = useTranslation();
	const isAdvanced = useAuthIsAdvanced((state) => state?.isAdvanced);
	const serverName = useBucketServersListStore((state) => state?.volumeList)[0].name;
	const serverList = useServerStore((state) => state.serverList);
	const volTypeList = useMemo(() => volumeTypeList(t), [t]);
	const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
	const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
	const [isDirty, setIsDirty] = useState(false);
	const [name, setName] = useState(volumeDetail?.name);
	const [type, setType] = useState<any>();
	const [id, setId] = useState(volumeDetail?.id);
	const [rootpath, setRootpath] = useState(volumeDetail?.rootpath);
	const [compressBlobs, setCompressBlobs] = useState(volumeDetail?.compressBlobs);
	const [isCurrent, setIsCurrent] = useState(volumeDetail?.isCurrent);
	const [compressionThreshold, setCompressionThreshold] = useState(
		volumeDetail?.compressionThreshold
	);
	const [previousDetail, setPreviousDetail] = useState<any>({});
	// const [currentVolumeName, setCurrentVolumeName] = useState('');
	const [externalVolDetail, setExternalVolDetail] = useState<any>('');
	const [backupUnusedBucketList, setBackupUnusedBucketList] = useState<any>([]);
	const [allocation, setAllocation] = useState<any>();
	const [bucketList, setBucketList] = useState<Array<object | any>>([]);
	const [bucketName, setBucketName] = useState('');
	const [storeType, setStoreType] = useState('');
	const [bucketConfigurationId, setBucketConfigurationId] = useState();
	const [bucketS3, setBucketS3] = useState(false);
	const [volumePrefix, setVolumePrefix] = useState<any>(externalVolDetail?.volumePrefix);
	const createSnackbar = useSnackbar();
	const { isVolumeAllDetail, setIsVolumeAllDetail } = useBucketVolumeStore((state) => state);

	const onUnusedBucketListChange = (e: any): any => {
		const selectedBucketDetail = isVolumeAllDetail?.filter((item: any) => item?.uuid === e)[0];

		setBucketName(selectedBucketDetail?.bucketName);
		setStoreType(selectedBucketDetail?.storeType);
		setBucketConfigurationId(selectedBucketDetail?.uuid);
	};

	const updatePreviousDetail = (): void => {
		const latestData: any = {};
		latestData.name = name;
		latestData.type = type;
		latestData.id = id;
		latestData.rootpath = rootpath;
		latestData.compressBlobs = compressBlobs;
		latestData.isCurrent = isCurrent;
		latestData.compressionThreshold = compressionThreshold;
		setPreviousDetail(latestData);
		setIsDirty(false);
	};

	const onSave = async (): Promise<void> => {
		if (isAdvanced) {
			const obj: any = {};
			obj._jsns = 'urn:zimbraAdmin';
			obj.module = 'ZxPowerstore';
			obj.action = 'doUpdateVolume';
			obj.targetServers = serverName;
			obj.currentVolumeName = volumeDetail?.name;
			obj.volumeName = name;
			obj.volumeType = type?.label?.toLowerCase();
			obj.volumeCurrent = isCurrent;
			obj.storeType = externalVolDetail?.storeType;

			if (externalVolDetail === '') {
				obj.volumePath = rootpath;
				obj.compressBlobs = compressBlobs ? 1 : 0;
				obj.compressionThreshold = Number(compressionThreshold);
			} else {
				if (
					externalVolDetail?.storeType?.toUpperCase() === ALIBABA?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === CEPH?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === CLOUDIAN?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === EMC?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === SCALITYS3?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === CUSTOM_S3?.toUpperCase()
				) {
					obj.volumePrefix = volumePrefix;
					obj.bucketConfigurationId = bucketConfigurationId;
				}
				if (externalVolDetail?.storeType?.toUpperCase() === S3?.toUpperCase()) {
					obj.volumePrefix = volumePrefix;
					obj.bucketConfigurationId = bucketConfigurationId;
					obj.useInfrequentAccess = false;
					obj.infrequentAccessThreshold = 'asd';
					obj.useIntelligentTiering = false;
				}
				if (externalVolDetail?.storeType?.toUpperCase() === FILEBLOB?.toUpperCase()) {
					obj.volumePath = '/tmp/store2';
					obj.volumeCompressed = false;
					obj.compressionThreshold = 'abc';
				}
				if (externalVolDetail?.storeType?.toUpperCase() === OPENIO?.toUpperCase()) {
					obj.url = '/tmp/store2';
					obj.account = 'abc';
					obj.namespace = 'abc';
					obj.proxyPort = 1;
					obj.accountPort = 1;
				}
				if (externalVolDetail?.storeType?.toUpperCase() === SWIFT?.toUpperCase()) {
					obj.url = '/tmp/store2';
					obj.username = 'abc';
					obj.password = 'abc';
					obj.authenticationMethod = 'BASIC';
					obj.authenticationMethodScope = 'DEFAULT';
					obj.tenantId = '12';
					obj.tenantName = '12';
					obj.domain = '12';
					obj.proxyHost = '12';
					obj.proxyPort = 10;
					obj.proxyUsername = 'abc';
					obj.proxyPassword = 'abc';
					obj.publicHost = 'abc';
					obj.privateHost = 'abc';
					obj.region = 'abc';
					obj.maxDeleteObjectsCount = 10;
				}
			}

			await fetchSoap('zextras', obj)
				.then((res: any) => {
					const result = JSON.parse(res?.Body?.response?.content);
					const updateResponse = result?.response?.[`${serverList[0]?.name}`];
					if (updateResponse?.ok) {
						createSnackbar({
							key: '1',
							type: 'success',
							label: t('label.external_volume_edited', '{{message}}', {
								message: updateResponse?.response?.message
							})
						});
						getAllVolumesRequest();
						setmodifyVolumeToggle(false);
					} else {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: t('label.volume_detail_error', '{{message}}', {
								message: updateResponse?.error?.message
							}),
							autoHideTimeout: 5000
						});
						setmodifyVolumeToggle(false);
					}
				})
				.catch((error: any) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: error
						}),
						autoHideTimeout: 5000
					});
					setmodifyVolumeToggle(false);
				});
		} else {
			await soapFetch(
				'ModifyVolume',
				{
					_jsns: 'urn:zimbraAdmin',
					module: 'ZxCore',
					action: 'ModifyVolumeRequest',
					id,
					volume: {
						id,
						name,
						rootpath,
						type: type?.value,
						compressBlobs: compressBlobs ? 1 : 0,
						compressionThreshold,
						isCurrent: isCurrent ? 1 : 0
					}
				},
				undefined,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				selectedServerId
			)
				.then(() => {
					if (isCurrent) {
						soapFetch(
							'SetCurrentVolume',
							{
								_jsns: 'urn:zimbraAdmin',
								module: 'ZxCore',
								action: 'SetCurrentVolumeRequest',
								id,
								type: type?.value
							},
							undefined,
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							selectedServerId
						).catch((error) => {
							createSnackbar({
								key: 'error',
								type: 'error',
								label: t('label.volume_detail_error', '{{message}}', {
									message: error
								}),
								autoHideTimeout: 5000
							});
						});
					}
					createSnackbar({
						key: '1',
						type: 'success',
						label: t('label.volume_edited', 'Volume edited successfully')
					});
					getAllVolumesRequest();
					setmodifyVolumeToggle(false);
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: error
						}),
						autoHideTimeout: 5000
					});
					setmodifyVolumeToggle(false);
				});
		}
		updatePreviousDetail();
	};

	const onUndo = (): void => {
		previousDetail?.name ? setName(previousDetail?.name) : setName(volumeDetail?.name);
		const volumeTypeObject = volTypeList?.find((item: any) => item?.value === volumeDetail?.type);
		previousDetail?.type ? setType(previousDetail?.type) : setType(volumeTypeObject);
		previousDetail?.id ? setId(previousDetail?.id) : setId(volumeDetail?.id);
		previousDetail?.rootpath
			? setRootpath(previousDetail?.rootpath)
			: setRootpath(volumeDetail?.rootpath);
		previousDetail?.compressBlobs
			? setCompressBlobs(previousDetail?.compressBlobs)
			: setCompressBlobs(volumeDetail?.compressBlobs);
		previousDetail?.isCurrent
			? setIsCurrent(previousDetail?.isCurrent)
			: setIsCurrent(volumeDetail?.isCurrent);
		previousDetail?.compressionThreshold
			? setCompressionThreshold(previousDetail?.compressionThreshold)
			: setCompressionThreshold(volumeDetail?.compressionThreshold);
		setIsDirty(false);
	};

	const onVolumeTypeChange = useCallback(
		(e: any): void => {
			const volumeObject: any = volTypeList?.find((item: any): any => item?.value === e);
			setType(volumeObject);
		},
		[volTypeList]
	);

	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';

	const getAllBuckets = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'listBuckets',
			type: 'all',
			targetServer: server,
			showSecrets: true
		}).then((res: any) => {
			const response = JSON.parse(res.Body.response.content);
			if (response.ok) {
				setBucketList(response.response.values);
				const bucName = response.response.values.find(
					(b: any) => b?.uuid === externalVolDetail?.bucketConfigurationId
				)?.bucketName;
				setBucketName(bucName);
				setStoreType(externalVolDetail?.storeType);
				setBucketConfigurationId(externalVolDetail?.bucketConfigurationId);

				const volUnusedBucketList: any = [];
				const allData = response?.response?.values
					?.filter((items: any) => items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED)
					.map((items: any) => {
						const volumeObject: any = bucketTypeItems?.find(
							(s) => s?.value?.toLowerCase() === items?.storeType?.toLowerCase()
						)?.label;
						volUnusedBucketList.push({
							label: `${volumeObject} | ${items?.label}`,
							value: items?.uuid
						});
						return items;
					});
				setIsVolumeAllDetail(allData);
				setBackupUnusedBucketList(volUnusedBucketList);
			} else {
				setBucketList([]);
			}
		});
	}, [
		bucketTypeItems,
		externalVolDetail?.bucketConfigurationId,
		externalVolDetail?.storeType,
		server,
		setIsVolumeAllDetail
	]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.name !== name) {
			setIsDirty(true);
		}

		if (externalVolDetail !== undefined && externalVolDetail?.name !== name) {
			setIsDirty(true);
		}
	}, [externalVolDetail, name, volumeDetail]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.type !== type?.value) {
			setIsDirty(true);
		}
	}, [type?.value, volumeDetail]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.id !== id) {
			setIsDirty(true);
		}
	}, [volumeDetail, id]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.rootpath !== rootpath) {
			setIsDirty(true);
		}
	}, [volumeDetail, rootpath]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.compressBlobs !== compressBlobs) {
			setIsDirty(true);
		}
	}, [volumeDetail, compressBlobs]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.isCurrent !== isCurrent) {
			setIsDirty(true);
		}
	}, [volumeDetail, isCurrent]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.compressionThreshold !== compressionThreshold) {
			setIsDirty(true);
		}
	}, [volumeDetail, compressionThreshold]);

	useEffect(() => {
		if (externalVolDetail !== undefined && externalVolDetail?.volumePrefix !== volumePrefix) {
			setIsDirty(true);
		}
	}, [externalVolDetail, volumePrefix]);

	useEffect(() => {
		if (
			externalVolDetail !== undefined &&
			bucketConfigurationId &&
			externalVolDetail?.bucketConfigurationId !== bucketConfigurationId
		) {
			setIsDirty(true);
		}
	}, [bucketConfigurationId, externalVolDetail]);

	useEffect(() => {
		setName(volumeDetail?.name);
		const volumeTypeObject = volTypeList?.find((item: any) => item?.value === volumeDetail?.type);
		setType(volumeTypeObject);
		setId(volumeDetail?.id);
		setRootpath(volumeDetail?.rootpath);
		setCompressBlobs(volumeDetail?.compressBlobs);
		setIsCurrent(volumeDetail?.isCurrent);
		setCompressionThreshold(volumeDetail?.compressionThreshold);
		setBucketS3(volumeDetail?.unusedBucketType === S3);
		setIsDirty(false);
	}, [volTypeList, volumeDetail]);

	useEffect(() => {
		getAllBuckets();
	}, [getAllBuckets, externalVolDetail]);

	useEffect(() => {
		if (isAdvanced) {
			if (volumeDetail?.type === 1) {
				// const volName = volumeList?.primaries?.filter((items: any) => items?.isCurrent)[0]?.name;
				// setCurrentVolumeName(volName);
				const volDetail = volumeList?.primaries?.filter(
					(items: any) => items?.id === volumeDetail?.id
				)[0];
				if (volDetail?.bucketConfigurationId) {
					setExternalVolDetail(volDetail);
					setVolumePrefix(volDetail?.volumePrefix);
				} else {
					setExternalVolDetail('');
				}
			}
			if (volumeDetail?.type === 2) {
				// const volName = volumeList?.secondaries?.filter((items: any) => items?.isCurrent)[0]?.name;
				// setCurrentVolumeName(volName);
				const volDetail = volumeList?.secondaries?.filter(
					(items: any) => items?.id === volumeDetail?.id
				)[0];
				if (volDetail?.bucketConfigurationId) {
					setExternalVolDetail(volDetail);
					setVolumePrefix(volDetail?.volumePrefix);
				} else {
					setExternalVolDetail('');
				}
			}
			if (volumeDetail?.type === 10) {
				// const volName = volumeList?.indexes?.filter((items: any) => items?.isCurrent)[0]?.name;
				// setCurrentVolumeName(volName);
				const volDetail = volumeList?.indexes?.filter(
					(items: any) => items?.id === volumeDetail?.id
				)[0];
				if (volDetail?.bucketConfigurationId) {
					setExternalVolDetail(volDetail);
					setVolumePrefix(volDetail?.volumePrefix);
				} else {
					setExternalVolDetail('');
				}
			}
		}
	}, [
		volumeList?.primaries,
		volumeDetail?.type,
		volumeList?.secondaries,
		volumeList?.indexes,
		isAdvanced,
		volumeDetail?.id
	]);

	useEffect(() => {
		const volumeTypeObject = volAllocationList?.find(
			(item: any) => item?.value === volumeDetail?.type
		);
		setAllocation(volumeTypeObject);
	}, [volAllocationList, volumeDetail?.type]);

	return (
		<>
			<Container background="gray6">
				<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
						<Text size="extralarge" weight="bold">
							{t('label.volume_detail_page_title', '{{message}} Details', {
								message: volumeDetail?.name
							})}
						</Text>
					</Row>
					<Row padding={{ horizontal: 'small' }}>
						<IconButton
							icon="CloseOutline"
							color="gray1"
							onClick={(): void => setmodifyVolumeToggle(false)}
						/>
					</Row>
				</Row>
				<Divider />
				<Container
					orientation="horizontal"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					background="gray6"
					padding={{ all: 'extralarge' }}
					height="5.313rem"
				>
					<Padding right="small">
						{isDirty && (
							<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
						)}
					</Padding>
					{isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
				</Container>
				{externalVolDetail === '' ? (
					<Container
						padding={{ horizontal: 'large', top: 'extralarge', bottom: 'large' }}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Row padding={{ top: 'small' }} width="100%">
							<Input
								label={t('label.volume_name', 'Volume Name')}
								value={name}
								backgroundColor="gray5"
								onChange={(e: any): any => setName(e?.target?.value)}
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Select
								items={volTypeList}
								background="gray5"
								label={t('label.volume_main', 'Volume Main')}
								selection={type}
								showCheckbox={false}
								onChange={onVolumeTypeChange}
								disabled
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.volume_id', 'Volume ID')}
								value={id}
								backgroundColor="gray6"
								onChange={(e: any): any => setId(e?.target?.value)}
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.path', 'Path')}
								value={rootpath}
								backgroundColor="gray5"
								onChange={(e: any): any => setRootpath(e?.target?.value)}
							/>
						</Row>
						<Padding top="extrasmall">
							<Text color="secondary" overflow="break-word" size="extrasmall">
								{t('the_change_will_not_move_the_data', 'The change will not move the data… !!')}
							</Text>
						</Padding>
						<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
							{volumeDetail?.type !== 10 && (
								<>
									<Row width="48%" mainAlignment="flex-start">
										<Switch
											value={compressBlobs}
											label={t('label.enable_compression', 'Enable Compression')}
											onClick={(): any => setCompressBlobs(!compressBlobs)}
										/>
										<Padding top="extrasmall">
											<Text color="secondary" overflow="break-word" size="extrasmall">
												{t(
													'this_will_not_affect_data_already_stored',
													'This will not affect data already stored'
												)}
											</Text>
										</Padding>
									</Row>
									<Padding width="4%" />
								</>
							)}
							<Row width="48%" mainAlignment="flex-start">
								<Switch
									value={isCurrent}
									label={t('label.current', 'Current')}
									onClick={(): any => setIsCurrent(!isCurrent)}
								/>
							</Row>
						</Row>
						{volumeDetail?.type !== 10 && (
							<Row padding={{ top: 'small' }} width="50%">
								<Input
									label={t('label.compression_threshold', 'Compression Threshold')}
									value={compressionThreshold}
									backgroundColor="gray6"
									onChange={(e: any): any => setCompressionThreshold(e?.target?.value)}
									color="secondary"
								/>
							</Row>
						)}
					</Container>
				) : (
					<Container
						padding={{ horizontal: 'large', top: 'extralarge', bottom: 'large' }}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Row padding={{ top: 'small' }} width="100%">
							<Input
								inputName="server"
								label={t('label.volume_server_name', 'Server')}
								value={serverName}
								backgroundColor="gray5"
								readyOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Select
								items={volAllocationList}
								background="gray5"
								label={t('label.storage_type', 'Storage Type')}
								showCheckbox={false}
								selection={allocation}
								disabled
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.volume_name', 'Volume Name')}
								value={name}
								backgroundColor="gray6"
								onChange={(e: any): any => setName(e?.target?.value)}
							/>
						</Row>
						{backupUnusedBucketList?.length !== 0 && (
							<>
								<Row padding={{ top: 'large' }} width="100%">
									<Select
										items={backupUnusedBucketList}
										background="gray5"
										label={t(
											'label.volume_available_unused_Buckets_list_in_backup',
											'Available Buckets List (that are not in use in the backup)'
										)}
										showCheckbox={false}
										selection={backupUnusedBucketList?.find(
											(b: any) => b.value === bucketConfigurationId
										)}
										onChange={onUnusedBucketListChange}
									/>
								</Row>
								<Padding top="extrasmall">
									<Text color="secondary" overflow="break-word" size="extrasmall">
										{t(
											'the_change_will_not_move_the_data',
											'The change will not move the data… !!'
										)}
									</Text>
								</Padding>
							</>
						)}
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'large', right: 'large' }}
							>
								<Input
									label={t('label.bucket_name', 'Bucket Name')}
									backgroundColor="gray6"
									value={bucketName}
									readOnly
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'large', right: 'large' }}
							>
								<Input
									label={t('label.type', 'Type')}
									backgroundColor="gray6"
									value={storeType}
									readOnly
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'large' }}
							>
								<Input
									label={t('label.ID', 'ID')}
									backgroundColor="gray6"
									value={bucketConfigurationId}
									readOnly
								/>
							</Container>
						</ListRow>
						<Row
							padding={{ top: 'large' }}
							width="100%"
							mainAlignment="center"
							crossAlignment="center"
							backgroundColor="gray6"
						>
							<Row width="48%">
								<Radio
									inputName="primary"
									label={t('label.primary_volume', 'This is a Primary Volume')}
									value={PRIMARY_TYPE_VALUE}
									checked={type?.value === 1}
									onClick={(): any => {
										onVolumeTypeChange(1);
									}}
								/>
							</Row>
							<Row width="48%">
								<Radio
									inputName="secondary"
									label={t('label.secondary_volume', 'This is a Secondary Volume')}
									value={SECONDARY_TYPE_VALUE}
									checked={type?.value === 2}
									onClick={(): any => {
										onVolumeTypeChange(2);
									}}
								/>
							</Row>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								inputName="prefix"
								label={t(
									'label.prefix_name',
									'Prefix - all objects will have this prefix in their name'
								)}
								value={volumePrefix}
								backgroundColor="gray5"
								onChange={(e: any): any => setVolumePrefix(e?.target?.value)}
							/>
						</Row>
						<Padding top="extrasmall">
							<Text color="secondary" overflow="break-word" size="extrasmall">
								{t('the_change_will_not_move_the_data', 'The change will not move the data… !!')}
							</Text>
						</Padding>
						{bucketS3 && (
							<>
								<Row
									padding={{ top: 'large' }}
									mainAlignment="flex-start"
									width="100%"
									backgroundColor="gray6"
								>
									<Row width="48.5%" mainAlignment="flex-start">
										<Row mainAlignment="flex-start" width="100%">
											<Switch
												value={externalVolDetail?.useInfrequentAccess}
												label={t('label.use_infraquent_access', 'Use infrequent access')}
												// onClick={changeSwitchInfraquentAccess}
												disabled
											/>
										</Row>
										<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
											<Text color="secondary">
												<Trans
													i18nKey="label.use_infraquent_access_helptext"
													defaults="<underline>Amazon Storage Class Documentation</underline>"
													components={{ underline: <u /> }}
												/>
											</Text>
										</Row>
									</Row>
									<Padding horizontal="small" />
									<Row width="48.5%" mainAlignment="flex-start">
										<Input
											inputName="infrequentAccessThreshold"
											label={t('label.size_threshold', 'Size Threshold')}
											backgroundColor="gray5"
											// onChange={changeVolDetail}
											disabled
										/>
									</Row>
								</Row>
								<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
									<Switch
										value={externalVolDetail?.useIntelligentTiering}
										label={t('label.use_intelligent_tiering', 'Use intelligent tiering')}
										// onClick={changeSwitchInfraquentTiering}
										disabled
									/>
								</Row>
								<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
									<Text color="secondary">
										<Trans
											i18nKey="label.use_intelligent_tiering_helptext"
											defaults="<underline>Amazon Tiering Documentation</underline>"
											components={{ underline: <u /> }}
										/>
									</Text>
								</Row>
							</>
						)}
						<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
							<Switch
								value={isCurrent}
								label={t('label.enable_current', 'Enable as Current')}
								onClick={(): any => setIsCurrent(!isCurrent)}
							/>
						</Row>
						<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
							<Text color="secondary">
								{t(
									'label.enable_current_helptext',
									'Enabling this option will disable the current active volume.'
								)}
							</Text>
						</Row>
						<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
							<Switch
								value={externalVolDetail?.centralized}
								label={t('label.storage_centralized', 'I want this Storage to be centralized')}
								// onClick={changeSwitchCentralized}
								disabled
							/>
						</Row>
						<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
							<Text color="secondary" style={{ whiteSpace: 'pre-line' }}>
								<Trans
									i18nKey="label.storage_centralized_helpertext"
									defaults="<bold>Use the CLI to manage the centralization.</bold> Centralized data becomes useful when two or more servers need access to the same data. By keeping data in one place, it’s easier to manage both the hardware and the data itself. "
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Row>
					</Container>
				)}
			</Container>
		</>
	);
};

export default ModifyVolume;

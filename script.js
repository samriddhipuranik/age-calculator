// set year's max attribute to current year
document.querySelector('#year').dataset.max = new Date().getFullYear()

document.querySelector('form').addEventListener('submit', e => {
	e.preventDefault()
	const formData = new FormData(e.target)
	const formProps = Object.fromEntries(formData) // !!!
	const errors = {}

	const today = new Date()
	today.setHours(0, 0, 0)
	const { day, month, year } = formProps
	const inputDate = new Date(year, month - 1, day)

	// error checking
	Object.keys(formProps).forEach(name => {
		const input = document.querySelector(`input[name=${name}]`)

		// remove errors:
		input.removeAttribute('aria-invalid')
		input.removeAttribute('aria-describedby')
		document.querySelector(`#${name}__hint`).textContent = ''
		document.querySelector(`label[for=${name}]`).classList.remove('error')

		const value = input.value.trim()
		const { min, max } = input.dataset
		const pattern = input.pattern

		if (input.required && !value) {
			errors[name] = 'This is a required field'
		} else if (pattern && !new RegExp(pattern).test(value)) {
			errors[name] = `Must be a valid ${name}`
		} else if (min && +value < +min) {
			errors[name] = `Must be a valid ${name}`
		} else if (max && +value > +max) {
			errors[name] = `Must be a valid ${name}`
		}
	})

	// year specific errors
	if (
		(errors['year'] && +formProps['year'] > today.getFullYear()) ||
		(!errors['month'] &&
			+formProps['month'] > today.getMonth() &&
			+formProps['year'] === today.getFullYear())
	) {
		errors['year'] = 'Must be in the past'
	}

	// debugger

	// no generic errors: check if date is valid/in the future
	if (Object.keys(errors).length === 0) {
		if (
			inputDate.getDate() != day ||
			inputDate.getMonth() + 1 != month ||
			inputDate.getFullYear() != year
		) {
			errors['day'] = `Must be a valid day`
			errors['month'] = errors['year'] = ''
		} else if (inputDate >= today) {
			errors['year'] = 'Must be in the past'
		}
	}

	// set errors:
	Object.keys(errors).forEach(name => {
		const input = document.querySelector(`input[name=${name}]`)
		const error = document.querySelector(`#${name}__hint`)

		// 'aria-invalid="true" aria-describedby="emailHint"'
		input.setAttribute('aria-invalid', true)
		input.setAttribute('aria-describedby', `${name}__hint`)
		error.textContent = errors[name]
		document.querySelector(`label[for=${name}]`).classList.add('error')
	})

	// set age
	if (Object.keys(errors).length === 0) {
		const { days, months, years } = getDateDiff(dayjs(inputDate), dayjs(today))

		const delay = 500

		numberAnimate(document.querySelector(`#age__years`), years, delay / years)
		numberAnimate(
			document.querySelector(`#age__months`),
			months,
			delay / months
		)
		numberAnimate(document.querySelector(`#age__days`), days, delay / days)
	}
})

function numberAnimate(domElement, value, delay) {
	for (let i = 0; i <= value; i++) {
		let timerID = setTimeout(() => {
			domElement.textContent = i
		}, delay * i)
	}
}

function getDateDiff(start, end) {
	const years = end.diff(start, 'year')
	const months = end.diff(start, 'month') - years * 12
	const days = end.diff(start.add(years, 'year').add(months, 'month'), 'day')

	return {
		years,
		months,
		days,
	}
}